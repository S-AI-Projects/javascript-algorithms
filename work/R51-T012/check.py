#!/usr/bin/env python3
"""Run focused BucketSort boundary checks and the repository Jest suite."""

import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WORK_DIR = Path(__file__).resolve().parent
TEST_FILE = WORK_DIR / "bucket-sort-boundary.test.js"
CASE_RESULTS_FILE = WORK_DIR / ".bucket-sort-boundary-results.json"
EVIDENCE_FILE = WORK_DIR / "results.json"
FOCUSED_JEST_RESULTS_FILE = WORK_DIR / ".focused-jest-results.json"
NATIVE_JEST_RESULTS_FILE = WORK_DIR / ".native-jest-results.json"

TEST_SOURCE = r"""
import fs from 'fs';
import BucketSort from '../../src/algorithms/sorting/bucket-sort/BucketSort';

const cases = [
  { name: 'empty collection', input: [], expected: [] },
  { name: 'single-element collection', input: [7], expected: [7] },
  { name: 'unsorted values', input: [3, 1, 2], expected: [1, 2, 3] },
  { name: 'duplicate values', input: [2, 2, 1], expected: [1, 2, 2] },
  { name: 'already ordered values', input: [1, 2, 3], expected: [1, 2, 3] },
  { name: 'reversed values', input: [3, 2, 1], expected: [1, 2, 3] },
];

const results = cases.map(({ name, input, expected }) => {
  const inputBefore = [...input];
  const actual = BucketSort(input);
  return { name, input: inputBefore, expected, actual, inputAfter: input };
});

fs.writeFileSync(process.env.BUCKET_SORT_CASE_RESULTS, JSON.stringify(results, null, 2));

describe('BucketSort supported boundary', () => {
  results.forEach(({ name, input, inputAfter, expected, actual }) => {
    test(name, () => {
      expect(actual).toEqual(expected);
      expect(inputAfter).toEqual(input);
    });
  });
});
"""


def command_result(command, env=None):
    return subprocess.run(
        command,
        cwd=ROOT,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def run_version(command):
    result = command_result(command)
    if result.returncode:
        print(result.stdout, file=sys.stderr)
        raise SystemExit(result.returncode)
    return result.stdout.strip()


def test_summary(json_path):
    if not json_path.exists():
        return None
    with json_path.open(encoding="utf-8") as results_file:
        result = json.load(results_file)
    return {
        "total": result.get("numTotalTests", 0),
        "passed": result.get("numPassedTests", 0),
        "failed": result.get("numFailedTests", 0),
    }


def main():
    versions = {
        "node": run_version(["node", "--version"]),
        "npm": run_version(["npm", "--version"]),
        "python": run_version(["python3", "--version"]),
    }
    TEST_FILE.write_text(TEST_SOURCE, encoding="utf-8")

    focused_command = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--runTestsByPath",
        TEST_FILE.relative_to(ROOT).as_posix(),
        "--json",
        f"--outputFile={FOCUSED_JEST_RESULTS_FILE.relative_to(ROOT).as_posix()}",
    ]
    native_command = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--json",
        f"--outputFile={NATIVE_JEST_RESULTS_FILE.relative_to(ROOT).as_posix()}",
    ]
    environment = os.environ.copy()
    environment["BUCKET_SORT_CASE_RESULTS"] = str(CASE_RESULTS_FILE)
    focused_exit = 0
    native_exit = 0

    try:
        focused_result = command_result(focused_command, environment)
        focused_exit = focused_result.returncode
        if focused_exit:
            print(focused_result.stdout, file=sys.stderr)

        native_result = command_result(native_command, environment)
        native_exit = native_result.returncode
        if native_exit:
            print(native_result.stdout, file=sys.stderr)

        cases = []
        if CASE_RESULTS_FILE.exists():
            with CASE_RESULTS_FILE.open(encoding="utf-8") as results_file:
                cases = json.load(results_file)

        evidence = {
            "versions": versions,
            "install_command": "npm ci",
            "focused_check": {
                "command": " ".join(focused_command),
                "test_count": test_summary(FOCUSED_JEST_RESULTS_FILE),
                "exit_code": focused_exit,
            },
            "native_check": {
                "command": " ".join(native_command),
                "test_count": test_summary(NATIVE_JEST_RESULTS_FILE),
                "exit_code": native_exit,
            },
            "cases": cases,
        }
        EVIDENCE_FILE.write_text(
            json.dumps(evidence, indent=2) + "\n", encoding="utf-8"
        )
    finally:
        TEST_FILE.unlink(missing_ok=True)
        CASE_RESULTS_FILE.unlink(missing_ok=True)
        FOCUSED_JEST_RESULTS_FILE.unlink(missing_ok=True)
        NATIVE_JEST_RESULTS_FILE.unlink(missing_ok=True)

    summary = evidence["native_check"]["test_count"]
    if summary is None or summary["total"] == 0:
        print("The native Jest run did not report any tests.", file=sys.stderr)
        return 1
    print(
        "BucketSort checks: "
        f"{len(evidence['cases'])} boundary cases; "
        f"native Jest {summary['passed']}/{summary['total']} passed, "
        f"{summary['failed']} failed."
    )
    return focused_exit or native_exit


if __name__ == "__main__":
    raise SystemExit(main())
