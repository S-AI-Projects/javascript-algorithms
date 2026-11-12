#!/usr/bin/env python3
"""Run SelectionSort's focused Jest checks and verify they detect a broken sorter."""

import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = Path(__file__).resolve().parent
TEST_PATH = "src/algorithms/sorting/selection-sort/__test__/SelectionSort.test.js"


def run(command, cwd, env=None):
    return subprocess.run(
        command,
        cwd=cwd,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def read_jest_results(path):
    with path.open(encoding="utf-8") as results_file:
        results = json.load(results_file)
    return {
        "totalTests": results["numTotalTests"],
        "passedTests": results["numPassedTests"],
        "failedTests": results["numFailedTests"],
    }


def run_mutation_check():
    with tempfile.TemporaryDirectory(prefix="selection-sort-mutation-") as temp_dir:
        sandbox = Path(temp_dir)
        shutil.copytree(ROOT / "src", sandbox / "src")
        for filename in (".babelrc", "jest.config.js", "package.json"):
            shutil.copy2(ROOT / filename, sandbox / filename)
        (sandbox / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)

        sorter_path = sandbox / "src/algorithms/sorting/selection-sort/SelectionSort.js"
        sorter_source = sorter_path.read_text(encoding="utf-8")
        correct_return = "    return array;"
        if sorter_source.count(correct_return) != 1:
            raise RuntimeError("Could not create the intentional SelectionSort mutation.")
        sorter_path.write_text(
            sorter_source.replace(correct_return, "    return [...originalArray];"),
            encoding="utf-8",
        )

        mutation_results_path = sandbox / "jest-results.json"
        command = [
            "npm",
            "test",
            "--",
            "--runInBand",
            "--runTestsByPath",
            TEST_PATH,
            "--json",
            "--outputFile=jest-results.json",
        ]
        result = run(command, sandbox)
        mutation = {
            "command": " ".join(command),
            "exitCode": result.returncode,
            "output": result.stdout,
        }
        if mutation_results_path.exists():
            mutation.update(read_jest_results(mutation_results_path))
        else:
            mutation.update({"totalTests": 0, "passedTests": 0, "failedTests": 0})
        return mutation


def main():
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    versions = {
        "python": sys.version.split()[0],
        "node": subprocess.check_output(["node", "--version"], text=True).strip(),
        "npm": subprocess.check_output(["npm", "--version"], text=True).strip(),
    }
    (EVIDENCE_DIR / "tool-versions.json").write_text(
        json.dumps(versions, indent=2) + "\n",
        encoding="utf-8",
    )

    cases_path = EVIDENCE_DIR / "cases.json"
    test_results_path = EVIDENCE_DIR / "jest-results.json"
    test_results_relative_path = "work/R51-T014/jest-results.json"
    command = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--runTestsByPath",
        TEST_PATH,
        "--json",
        f"--outputFile={test_results_relative_path}",
    ]
    env = os.environ.copy()
    env["SELECTION_SORT_EVIDENCE_PATH"] = str(cases_path)
    result = run(command, ROOT, env)
    (EVIDENCE_DIR / "test-run.log").write_text(result.stdout, encoding="utf-8")
    print(result.stdout, end="")

    summary = {
        "testCommand": " ".join(command),
        "testExitCode": result.returncode,
        "mutationCheck": None,
    }
    if test_results_path.exists():
        summary.update(read_jest_results(test_results_path))
    else:
        summary.update({"totalTests": 0, "passedTests": 0, "failedTests": 0})

    if result.returncode == 0:
        mutation = run_mutation_check()
        summary["mutationCheck"] = {
            key: value for key, value in mutation.items() if key != "output"
        }
        (EVIDENCE_DIR / "mutation-check.log").write_text(
            mutation["output"],
            encoding="utf-8",
        )
        print(mutation["output"], end="")
        if mutation["exitCode"] == 0 or mutation["failedTests"] == 0:
            summary["mutationCheck"]["detected"] = False
        else:
            summary["mutationCheck"]["detected"] = True

    (EVIDENCE_DIR / "run-summary.json").write_text(
        json.dumps(summary, indent=2) + "\n",
        encoding="utf-8",
    )

    if result.returncode != 0:
        return result.returncode
    if not cases_path.exists():
        print("SelectionSort case evidence was not generated.", file=sys.stderr)
        return 1
    if not summary["mutationCheck"] or not summary["mutationCheck"]["detected"]:
        print("The invariant checks did not reject the deliberate mutation.", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
