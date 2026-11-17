#!/usr/bin/env python3
"""
R51-T034 · check.py
Focused runner for hanoiTowerRecursive invariant and property checks,
including verification that checks detect an intentional mutation breaking the invariant.

Source under test:
  src/algorithms/uncategorized/hanoi-tower/hanoiTower.js

Invariants verified:
  1. Move Count Invariant: Exactly (2^n - 1) moves to transfer n discs.
  2. Valid Placement Invariant: A disc is never placed on top of a smaller disc.
  3. Conservation of Discs: Total collection of discs across all poles is conserved.
  4. Deterministic Transfer Invariant: Top n discs transferred in original relative order.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK_DIR = Path(__file__).resolve().parent
TEST_PATH = "src/algorithms/uncategorized/hanoi-tower/__test__/hanoiTower.test.js"
JEST_RESULTS_FILE = WORK_DIR / "jest-results.json"
CASES_FILE = WORK_DIR / "cases.json"
RESULTS_FILE = WORK_DIR / "results.json"
RUN_SUMMARY_FILE = WORK_DIR / "run-summary.json"
TOOL_VERSIONS_FILE = WORK_DIR / "tool-versions.json"


def get_tool_versions():
    def run_cmd(cmd):
        return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()

    return {
        "node": run_cmd(["node", "--version"]),
        "npm": run_cmd(["npm", "--version"]),
        "python": sys.version.split()[0],
    }


def read_jest_results(path):
    if not path.exists():
        return {"totalTests": 0, "passedTests": 0, "failedTests": 0}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {
        "totalTests": data.get("numTotalTests", 0),
        "passedTests": data.get("numPassedTests", 0),
        "failedTests": data.get("numFailedTests", 0),
    }


def run_mutation_check():
    """Verify that property checks fail when an invariant is deliberately broken."""
    with tempfile.TemporaryDirectory(prefix="hanoi-mutation-") as temp_dir:
        sandbox = Path(temp_dir)
        shutil.copytree(ROOT / "src", sandbox / "src")
        for filename in (".babelrc", "jest.config.js", "package.json"):
            if (ROOT / filename).exists():
                shutil.copy2(ROOT / filename, sandbox / filename)
        (sandbox / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)

        target_file = sandbox / "src/algorithms/uncategorized/hanoi-tower/hanoiTower.js"
        source = target_file.read_text(encoding="utf-8")

        # Mutate base case: push to withPole instead of toPole to violate the transfer invariant
        original_line = "toPole.push(disc);"
        mutated_line = "withPole.push(disc);"
        if original_line not in source:
            raise RuntimeError("Could not find target line to inject mutation.")

        target_file.write_text(source.replace(original_line, mutated_line, 1), encoding="utf-8")

        mutation_output_file = sandbox / "jest-mutation-results.json"
        cmd = [
            "npm",
            "test",
            "--",
            "--runInBand",
            "--watch=false",
            TEST_PATH,
            "--json",
            f"--outputFile={mutation_output_file}",
        ]
        res = subprocess.run(cmd, cwd=sandbox, capture_output=True, text=True)

        mutation_results = read_jest_results(mutation_output_file)
        mutation_detected = res.returncode != 0 and mutation_results["failedTests"] > 0

        return {
            "command": " ".join(cmd),
            "exitCode": res.returncode,
            "detected": mutation_detected,
            "totalTests": mutation_results["totalTests"],
            "passedTests": mutation_results["passedTests"],
            "failedTests": mutation_results["failedTests"],
        }


def main():
    print("=" * 60)
    print("R51-T034: hanoiTowerRecursive Invariant & Property Check Runner")
    print("=" * 60)

    WORK_DIR.mkdir(parents=True, exist_ok=True)
    tool_versions = get_tool_versions()
    print(f"Node   : {tool_versions['node']}")
    print(f"npm    : {tool_versions['npm']}")
    print(f"Python : {tool_versions['python']}")
    print()

    TOOL_VERSIONS_FILE.write_text(json.dumps(tool_versions, indent=2) + "\n", encoding="utf-8")

    env = os.environ.copy()
    env["HANOI_EVIDENCE_PATH"] = str(CASES_FILE)

    command = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--watch=false",
        TEST_PATH,
        "--json",
        f"--outputFile={JEST_RESULTS_FILE.relative_to(ROOT)}",
    ]

    print(f"Executing: {' '.join(command)}")
    result = subprocess.run(command, cwd=ROOT, env=env, capture_output=True, text=True)

    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)

    jest_results = read_jest_results(JEST_RESULTS_FILE)
    total_tests = jest_results["totalTests"]
    passed_tests = jest_results["passedTests"]
    failed_tests = jest_results["failedTests"]

    print(f"Total tests  : {total_tests}")
    print(f"Passed tests : {passed_tests}")
    print(f"Failed tests : {failed_tests}")

    if total_tests == 0 or failed_tests > 0 or result.returncode != 0:
        print(f"FAIL: Tests failed or did not run (returncode {result.returncode}).", file=sys.stderr)
        return result.returncode if result.returncode != 0 else 1

    # Run mutation check to ensure tests detect invariant violations
    print("\nRunning intentional mutation check...")
    mutation_info = run_mutation_check()
    print(f"Mutation check detected: {mutation_info['detected']} (exit code {mutation_info['exitCode']}, {mutation_info['failedTests']} failed)")

    if not mutation_info["detected"]:
        print("FAIL: Mutation check did not detect invariant violation!", file=sys.stderr)
        return 1

    run_summary = {
        "testCommand": " ".join(command),
        "testExitCode": result.returncode,
        "totalTests": total_tests,
        "passedTests": passed_tests,
        "failedTests": failed_tests,
        "mutationCheck": mutation_info,
    }
    RUN_SUMMARY_FILE.write_text(json.dumps(run_summary, indent=2) + "\n", encoding="utf-8")

    cases_data = {}
    if CASES_FILE.exists():
        with open(CASES_FILE, "r", encoding="utf-8") as f:
            cases_data = json.load(f)

    results_data = {
        "task": "R51-T034",
        "target": "src/algorithms/uncategorized/hanoi-tower",
        "tool_versions": tool_versions,
        "summary": run_summary,
        "evidence": cases_data,
    }
    RESULTS_FILE.write_text(json.dumps(results_data, indent=2) + "\n", encoding="utf-8")

    print(f"\nAll evidence saved under {WORK_DIR}")
    print("ALL CHECKS PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
