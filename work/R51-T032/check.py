#!/usr/bin/env python3
"""
R51-T032 · check.py
Focused runner for shortestCommonSupersequence boundary specifications and tests.

Item under test:
  src/algorithms/sets/shortest-common-supersequence

Preconditions and source lines:
  - Smallest valid input: [] and [] -> []
    shortestCommonSupersequence.js lines 29-31 (empty LCS / concatenation branch)
    README.md lines 3-4 (definition of SCS on sequences)
  - Boundary: one empty sequence: [] and ['A'] -> ['A'], ['A'] and [] -> ['A']
    shortestCommonSupersequence.js lines 29-31
  - Boundary: single-element sequences: ['A'] and ['A'] -> ['A'], ['A'] and ['B'] -> ['A', 'B']
    shortestCommonSupersequence.js lines 23-84
  - Ordinary input: ['A', 'G', 'G', 'T', 'A', 'B'] and ['G', 'X', 'T', 'X', 'A', 'Y', 'B'] -> ['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B']
    README.md lines 40-42, shortestCommonSupersequence.js lines 23-84
  - Ordinary input: ['G', 'E', 'E', 'K'] and ['E', 'K', 'E'] -> ['G', 'E', 'K', 'E', 'K']
    README.md lines 37-38, shortestCommonSupersequence.js lines 23-84
  - Non-mutation: inputs are preserved
    shortestCommonSupersequence.js lines 23-84
"""

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK_DIR = Path(__file__).resolve().parent
JEST_RESULTS_FILE = WORK_DIR / "jest-results.json"
RESULTS_FILE = WORK_DIR / "results.json"
TEST_PATH = "src/algorithms/sets/shortest-common-supersequence/__test__/shortestCommonSupersequence.test.js"

CASES = [
    {
        "name": "smallest valid input (both empty sequences)",
        "input": {"set1": [], "set2": []},
        "expected": [],
        "precondition_source_line": "shortestCommonSupersequence.js:29-31, README.md:3-4",
    },
    {
        "name": "boundary: first sequence empty, second singleton",
        "input": {"set1": [], "set2": ["A"]},
        "expected": ["A"],
        "precondition_source_line": "shortestCommonSupersequence.js:29-31, README.md:3-4",
    },
    {
        "name": "boundary: first sequence singleton, second empty",
        "input": {"set1": ["A"], "set2": []},
        "expected": ["A"],
        "precondition_source_line": "shortestCommonSupersequence.js:29-31, README.md:3-4",
    },
    {
        "name": "boundary: single-element identical sequences",
        "input": {"set1": ["A"], "set2": ["A"]},
        "expected": ["A"],
        "precondition_source_line": "shortestCommonSupersequence.js:23-84, README.md:3-4",
    },
    {
        "name": "boundary: single-element disjoint sequences",
        "input": {"set1": ["A"], "set2": ["B"]},
        "expected": ["A", "B"],
        "precondition_source_line": "shortestCommonSupersequence.js:29-31, README.md:3-4",
    },
    {
        "name": "ordinary input from README.md (geek and eke)",
        "input": {"set1": ["G", "E", "E", "K"], "set2": ["E", "K", "E"]},
        "expected": ["G", "E", "K", "E", "K"],
        "precondition_source_line": "README.md:37-38, shortestCommonSupersequence.js:23-84",
    },
    {
        "name": "ordinary input from README.md (AGGTAB and GXTXAYB)",
        "input": {
            "set1": ["A", "G", "G", "T", "A", "B"],
            "set2": ["G", "X", "T", "X", "A", "Y", "B"],
        },
        "expected": ["A", "G", "G", "X", "T", "X", "A", "Y", "B"],
        "precondition_source_line": "README.md:40-42, shortestCommonSupersequence.js:23-84",
    },
    {
        "name": "non-mutation check",
        "input": {
            "set1": ["A", "G", "G", "T", "A", "B"],
            "set2": ["G", "X", "T", "X", "A", "Y", "B"],
        },
        "expected": {
            "result": ["A", "G", "G", "X", "T", "X", "A", "Y", "B"],
            "set1_unmutated": True,
            "set2_unmutated": True,
        },
        "precondition_source_line": "shortestCommonSupersequence.js:23-84",
    },
]


def get_tool_versions():
    def run_cmd(cmd):
        return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()

    return {
        "node": run_cmd(["node", "--version"]),
        "npm": run_cmd(["npm", "--version"]),
        "python": sys.version.split()[0],
    }


def main():
    print("=" * 60)
    print("R51-T032: shortestCommonSupersequence boundary check runner")
    print("=" * 60)

    tool_versions = get_tool_versions()
    print(f"Node   : {tool_versions['node']}")
    print(f"npm    : {tool_versions['npm']}")
    print(f"Python : {tool_versions['python']}")
    print()

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
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)

    stdout = result.stdout
    stderr = result.stderr
    print(stdout)
    if stderr:
        print(stderr, file=sys.stderr)

    if not JEST_RESULTS_FILE.exists():
        print(f"FAIL: Jest results file not found at {JEST_RESULTS_FILE}", file=sys.stderr)
        return 1

    with open(JEST_RESULTS_FILE, "r", encoding="utf-8") as f:
        jest_data = json.load(f)

    total_tests = jest_data.get("numTotalTests", 0)
    passed_tests = jest_data.get("numPassedTests", 0)
    failed_tests = jest_data.get("numFailedTests", 0)

    print(f"Total tests  : {total_tests}")
    print(f"Passed tests : {passed_tests}")
    print(f"Failed tests : {failed_tests}")

    if total_tests == 0:
        print("FAIL: Zero tests were executed.", file=sys.stderr)
        return 1

    if failed_tests > 0 or result.returncode != 0:
        print(f"FAIL: {failed_tests} tests failed.", file=sys.stderr)
        return result.returncode if result.returncode != 0 else 1

    # Record evidence
    evidence = {
        "task": "R51-T032",
        "target": "src/algorithms/sets/shortest-common-supersequence",
        "tool_versions": tool_versions,
        "command": " ".join(command),
        "test_count": {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
        },
        "cases": CASES,
    }

    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(evidence, f, indent=2)
        f.write("\n")

    print(f"Evidence successfully written to {RESULTS_FILE}")
    print("ALL CHECKS PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
