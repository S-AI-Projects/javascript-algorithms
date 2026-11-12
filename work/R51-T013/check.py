#!/usr/bin/env python3
"""Install locked dependencies and run the deque reference regression checks."""

import json
import os
import platform
import subprocess
import sys
from pathlib import Path


WORK_DIR = Path(__file__).resolve().parent
ROOT_DIR = WORK_DIR.parents[1]
COMPARISONS_FILE = WORK_DIR / "comparisons.json"
JEST_RESULTS_FILE = WORK_DIR / "jest-results.json"
REPORT_FILE = WORK_DIR / "results.json"


def command_version(command):
    result = subprocess.run(
        command,
        cwd=ROOT_DIR,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def run(command, environment=None):
    return subprocess.run(
        command,
        cwd=ROOT_DIR,
        check=False,
        env=environment,
        text=True,
    )


def main():
    versions = {
        "python": platform.python_version(),
        "node": command_version(["node", "--version"]),
        "npm": command_version(["npm", "--version"]),
    }
    report = {
        "versions": versions,
        "source_preconditions": {
            "smallest_input": (
                "Deque.js:4-10 initializes the empty deque with no constructor "
                "arguments."
            ),
            "ordinary_input": (
                "Deque.js:47-59 establishes the addFront/addBack operations used "
                "by the ordinary sequence."
            ),
        },
        "oracle_adjustment": {
            "minimal_input": [["addBack", None]],
            "initial_discrepancy": (
                "The first array oracle used Array.join(), which renders a "
                "stored null as an empty string; the deque renders it as "
                "'null' through the linked-list node's template-string "
                "conversion."
            ),
            "reduced_case": (
                "Deque.js:110-112 delegates to "
                "DoublyLinkedListNode.js:8-10; adding only null produces "
                "toString() === 'null'."
            ),
            "resolution": (
                "The independent array oracle now stringifies each element "
                "with template-string conversion before joining. No "
                "implementation change was warranted."
            ),
        },
        "install_command": "npm ci",
        "test_command": (
            "npm test -- --runInBand --json "
            "--outputFile=work/R51-T013/jest-results.json"
        ),
    }

    install = run(["npm", "ci"])
    report["install_exit_code"] = install.returncode
    if install.returncode != 0:
        REPORT_FILE.write_text(f"{json.dumps(report, indent=2)}\n")
        return install.returncode

    environment = os.environ.copy()
    environment["DEQUE_EVIDENCE_FILE"] = str(COMPARISONS_FILE)
    test_command = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--json",
        f"--outputFile={JEST_RESULTS_FILE.relative_to(ROOT_DIR)}",
    ]
    test_run = run(test_command, environment)
    report["test_exit_code"] = test_run.returncode

    if JEST_RESULTS_FILE.exists():
        jest_results = json.loads(JEST_RESULTS_FILE.read_text())
        report["jest_summary"] = {
            "total_tests": jest_results["numTotalTests"],
            "passed_tests": jest_results["numPassedTests"],
            "failed_tests": jest_results["numFailedTests"],
            "pending_tests": jest_results["numPendingTests"],
            "test_suites": jest_results["numTotalTestSuites"],
        }

    if COMPARISONS_FILE.exists():
        report["comparisons"] = json.loads(COMPARISONS_FILE.read_text())

    REPORT_FILE.write_text(f"{json.dumps(report, indent=2)}\n")
    return test_run.returncode


if __name__ == "__main__":
    sys.exit(main())
