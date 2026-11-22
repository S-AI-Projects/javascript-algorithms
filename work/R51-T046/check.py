import json
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = Path(__file__).resolve().parent
TEST_FILE = (
    "src/algorithms/math/sieve-of-eratosthenes/__test__/sieveOfEratosthenes.test.js"
)

FIXTURE_INPUTS = [1, 2, 9, 11, 12]
EXPECTED_OUTPUTS = {
    "1": [],
    "2": [2],
    "9": [2, 3, 5, 7],
    "11": [2, 3, 5, 7, 11],
    "12": [2, 3, 5, 7, 11],
}

ACTUAL_RESULTS_RUNNER = """
import sieveOfEratosthenes from './src/algorithms/math/sieve-of-eratosthenes/sieveOfEratosthenes.js';

const fixtureInputs = [1, 2, 9, 11, 12];
const actualOutputs = {};
for (const n of fixtureInputs) {
  actualOutputs[String(n)] = sieveOfEratosthenes(n);
}

const callerState = { maxNumber: 12, tag: 'caller-owned' };
const before = JSON.stringify(callerState);
const result = sieveOfEratosthenes(callerState.maxNumber);
const after = JSON.stringify(callerState);

process.stdout.write(JSON.stringify({
  actual_outputs: actualOutputs,
  caller_state_preserved: before === after,
  result_12: result,
}));
"""


def run_command(command):
    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return {
        "command": command,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def test_counts(result):
    combined_output = result["stdout"] + result["stderr"]
    summary = re.search(r"Tests:\s+(.+)", combined_output)
    if not summary:
        return {"passed": None, "failed": None, "summary": None}

    text = summary.group(1)
    passed = re.search(r"(\d+) passed", text)
    failed = re.search(r"(\d+) failed", text)
    return {
        "passed": int(passed.group(1)) if passed else 0,
        "failed": int(failed.group(1)) if failed else 0,
        "summary": text,
    }


def main():
    versions = {
        "node": run_command(["node", "--version"]),
        "npm": run_command(["npm", "--version"]),
        "python": run_command(["python3", "--version"]),
    }

    install = run_command(["npm", "ci", "--no-audit", "--no-fund"])

    actual_run = run_command(
        ["node", "--input-type=module", "-e", ACTUAL_RESULTS_RUNNER]
    )
    try:
        actual_data = (
            json.loads(actual_run["stdout"])
            if actual_run["returncode"] == 0
            else {}
        )
    except Exception:
        actual_data = {}

    focused_tests = run_command(
        ["npm", "test", "--", "--runInBand", TEST_FILE]
    )
    full_tests = run_command(["npm", "test", "--", "--runInBand"])
    lint = run_command(["npm", "run", "lint"])
    diff_check = run_command(["git", "diff", "--check"])

    focused_counts = test_counts(focused_tests)
    full_counts = test_counts(full_tests)

    evidence = {
        "versions": versions,
        "install": install,
        "actual_execution": actual_run,
        "focused_tests": {
            **focused_tests,
            "counts": focused_counts,
        },
        "full_tests": {
            **full_tests,
            "counts": full_counts,
        },
        "lint": lint,
        "diff_check": diff_check,
    }

    results = {
        "item": "src/algorithms/math/sieve-of-eratosthenes",
        "task_type": "Focused refactoring",
        "refactored_responsibility": "markMultiples (composite multiple elimination)",
        "inputs": {
            "fixture_inputs": FIXTURE_INPUTS,
        },
        "expected_outputs": EXPECTED_OUTPUTS,
        "actual_outputs": actual_data.get("actual_outputs", {}),
        "caller_state_preserved": actual_data.get("caller_state_preserved", False),
        "focused_test_counts": focused_counts,
        "full_test_counts": full_counts,
    }

    target_dir = ROOT / "work" / "R51-T046"
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "evidence.json").write_text(
        json.dumps(evidence, indent=2) + os.linesep,
        encoding="utf-8",
    )
    (target_dir / "results.json").write_text(
        json.dumps(results, indent=2) + os.linesep,
        encoding="utf-8",
    )

    checks = [
        *versions.values(),
        install,
        actual_run,
        focused_tests,
        full_tests,
        lint,
        diff_check,
    ]
    if any(check["returncode"] != 0 for check in checks):
        sys.exit(1)

    if actual_data.get("actual_outputs") != EXPECTED_OUTPUTS:
        sys.exit(1)
    if not actual_data.get("caller_state_preserved"):
        sys.exit(1)
    if (focused_counts["failed"] or 0) > 0 or (focused_counts["passed"] or 0) < 1:
        sys.exit(1)
    if (full_counts["failed"] or 0) > 0 or (full_counts["passed"] or 0) < 1:
        sys.exit(1)


if __name__ == "__main__":
    main()
