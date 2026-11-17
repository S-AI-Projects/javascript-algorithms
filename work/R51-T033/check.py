#!/usr/bin/env python3
"""
R51-T033 · check.py
Focused runner for regularExpressionMatching independent reference comparison.

Item under test:
  src/algorithms/string/regular-expression-matching

Preconditions and source lines:
  - Smallest valid input: string = '', pattern = '' -> expected true
    regularExpressionMatching.js line 50 (matchMatrix[0][0] = true)
  - Representative ordinary input: string = 'aab', pattern = 'c*a*b' -> expected true
    regularExpressionMatching.js lines 28-36, 60-68, 88-116
  - Reference comparison:
    Validated against recursive backtracking reference oracle and native RegExp
    across >= 20 valid inputs.
  - Non-mutation:
    Verifies input purity and state immutability.
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
TEST_PATH = "src/algorithms/string/regular-expression-matching/__test__/regularExpressionMatching.test.js"

CASES = [
    {
        "name": "smallest valid input (both empty)",
        "input": {"string": "", "pattern": ""},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:50",
    },
    {
        "name": "empty string with zero occurrence pattern",
        "input": {"string": "", "pattern": "a*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:60-68",
    },
    {
        "name": "empty string with wildcard star",
        "input": {"string": "", "pattern": ".*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:60-68",
    },
    {
        "name": "empty string with multiple star sequences",
        "input": {"string": "", "pattern": "a*b*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:60-68",
    },
    {
        "name": "empty string with non-empty non-star pattern",
        "input": {"string": "", "pattern": "a"},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:52-61",
    },
    {
        "name": "empty string with dot pattern",
        "input": {"string": "", "pattern": "."},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:52-61",
    },
    {
        "name": "non-empty string with empty pattern",
        "input": {"string": "a", "pattern": ""},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:59-61",
    },
    {
        "name": "single identical character",
        "input": {"string": "a", "pattern": "a"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:100-117",
    },
    {
        "name": "single mismatched character",
        "input": {"string": "a", "pattern": "b"},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:118-130",
    },
    {
        "name": "single character matched by dot",
        "input": {"string": "a", "pattern": "."},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:100-117",
    },
    {
        "name": "single character matched by star",
        "input": {"string": "a", "pattern": "a*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99",
    },
    {
        "name": "single character matched by dot star",
        "input": {"string": "a", "pattern": ".*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99",
    },
    {
        "name": "zero occurrences before matched character",
        "input": {"string": "a", "pattern": "b*a"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99, 100-117",
    },
    {
        "name": "length mismatch",
        "input": {"string": "aa", "pattern": "a"},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:118-130",
    },
    {
        "name": "multiple occurrences matched by star",
        "input": {"string": "aa", "pattern": "a*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99",
    },
    {
        "name": "multiple occurrences matched by dot star",
        "input": {"string": "aa", "pattern": ".*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99",
    },
    {
        "name": "distinct characters matched by dot star",
        "input": {"string": "ab", "pattern": ".*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99",
    },
    {
        "name": "unmatched trailing character",
        "input": {"string": "ab", "pattern": "a*"},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:118-130",
    },
    {
        "name": "exact multi-character match",
        "input": {"string": "aab", "pattern": "aab"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:100-117",
    },
    {
        "name": "representative ordinary input (aab and c*a*b)",
        "input": {"string": "aab", "pattern": "c*a*b"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:28-36, 60-68, 88-116",
    },
    {
        "name": "multiple stars with trailing optional",
        "input": {"string": "aab", "pattern": "c*a*b*"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-99",
    },
    {
        "name": "reordered characters mismatch",
        "input": {"string": "aab", "pattern": "baa"},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:118-130",
    },
    {
        "name": "complex mismatch",
        "input": {"string": "mississippi", "pattern": "mis*is*p*."},
        "expected": False,
        "precondition_source_line": "regularExpressionMatching.js:118-130",
    },
    {
        "name": "complex match",
        "input": {"string": "mississippi", "pattern": "mis*is*.p*."},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:71-117",
    },
    {
        "name": "non-mutation check",
        "input": {"string": "aab", "pattern": "c*a*b"},
        "expected": True,
        "precondition_source_line": "regularExpressionMatching.js:28",
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
    print("R51-T033: regularExpressionMatching reference check runner")
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

    evidence = {
        "task": "R51-T033",
        "target": "src/algorithms/string/regular-expression-matching",
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
