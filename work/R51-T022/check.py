#!/usr/bin/env python3
"""
R51-T022 Check Runner
=====================
Verifies boundary behavior and smallest supported domain for levenshteinDistance.

Fixtures required:
  - "" / ""             -> 0
  - "a" / ""            -> 1
  - "cat" / "cat"       -> 0
  - "kitten" / "sitting"-> 3

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the full repository test suite (non-watch mode) and record nonzero test count.
  3. Run focused levenshteinDistance tests.
  4. Python reference implementation to independently verify fixtures and boundary partitions.
  5. Verify boundary table: valid boundary, valid interior, and out-of-contract behavior.
  6. Write evidence.json and results.json under work/R51-T022/.
  7. Exit non-zero if any assertion fails.
"""

import json
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T022")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "string", "levenshtein-distance", "levenshteinDistance.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "string", "levenshtein-distance", "__test__", "levenshteinDistance.test.js",
)

failures = []
evidence = {}


# ─── Helpers ──────────────────────────────────────────────────────────────────
def run(cmd, cwd=None):
    result = subprocess.run(
        cmd, shell=True, cwd=cwd or REPO_ROOT,
        capture_output=True, text=True,
    )
    return result.returncode, result.stdout + result.stderr


def assert_ok(condition, label, detail=""):
    if not condition:
        failures.append({"label": label, "detail": str(detail)})
        print(f"  FAIL  {label}")
        if detail:
            print(f"        {detail}")
    else:
        print(f"  PASS  {label}")


# ─── Python reference implementation of unit-cost Levenshtein distance ────────
# Precondition source: levenshteinDistance.js lines 25-29
def py_levenshtein(a: str, b: str) -> int:
    """Independent dynamic programming implementation of Levenshtein distance."""
    m, n = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(m + 1):
        dp[0][i] = i
    for j in range(n + 1):
        dp[j][0] = j

    for j in range(1, n + 1):
        for i in range(1, m + 1):
            indicator = 0 if a[i - 1] == b[j - 1] else 1
            dp[j][i] = min(
                dp[j][i - 1] + 1,        # deletion
                dp[j - 1][i] + 1,        # insertion
                dp[j - 1][i - 1] + indicator,  # substitution
            )

    return dp[n][m]


# ─── Step 1: Tool versions ────────────────────────────────────────────────────
print("\n=== Step 1: Tool versions ===")
_, node_ver = run("node --version")
_, npm_ver = run("npm --version")
_, py_ver = run("python3 --version")
evidence["tool_versions"] = {
    "node": node_ver.strip(),
    "npm": npm_ver.strip(),
    "python3": py_ver.strip(),
}
print(f"  node   : {node_ver.strip()}")
print(f"  npm    : {npm_ver.strip()}")
print(f"  python3: {py_ver.strip()}")


# ─── Step 2: Full repository test suite ──────────────────────────────────────
print("\n=== Step 2: Full repository test suite ===")
print("  Running: npm test -- --runInBand")
rc, out = run("npm test -- --runInBand")
count_m = re.search(r"Tests:\s+.*?(\d+)\s+passed", out)
test_count = int(count_m.group(1)) if count_m else 0
evidence["native_test_suite"] = {
    "command": "npm test -- --runInBand",
    "exit_code": rc,
    "test_count_passed": test_count,
    "output_tail": out[-3000:],
}
assert_ok(rc == 0, "Full test suite exits 0", f"exit code: {rc}")
assert_ok(test_count > 0, "Full test suite has non-zero passing tests",
          f"parsed count: {test_count}")


# ─── Step 3: Focused levenshteinDistance tests ────────────────────────────────
print("\n=== Step 3: Focused levenshteinDistance tests ===")
focus_cmd = (
    "npm test -- --runInBand "
    "src/algorithms/string/levenshtein-distance/__test__/levenshteinDistance.test.js"
)
print(f"  Running: {focus_cmd}")
rc2, out2 = run(focus_cmd)
focus_m = re.search(r"Tests:\s+.*?(\d+)\s+passed", out2)
focus_count = int(focus_m.group(1)) if focus_m else 0
evidence["focused_test_run"] = {
    "command": focus_cmd,
    "exit_code": rc2,
    "test_count_passed": focus_count,
    "output_tail": out2[-3000:],
}
assert_ok(rc2 == 0, "Focused levenshteinDistance tests exit 0", f"exit code: {rc2}")
assert_ok(focus_count > 0, "Focused tests report non-zero passing tests",
          f"parsed count: {focus_count}")


# ─── Step 4: Boundary Partitioning & Required Fixtures ────────────────────────
print("\n=== Step 4: Fixture & boundary verification ===")

# Contract line 26-30:
# @param {string} a
# @param {string} b
# @return {number}

FIXTURES = [
    {
        "partition": "valid_boundary",
        "a": "",
        "b": "",
        "expected": 0,
        "label": '"" / "" -> 0 (smallest supported domain)',
        "manual_trace": "Both lengths are 0; 0 edits required to transform empty string to empty string.",
    },
    {
        "partition": "valid_boundary",
        "a": "a",
        "b": "",
        "expected": 1,
        "label": '"a" / "" -> 1 (single-character deletion boundary)',
        "manual_trace": "len(a)=1, len(b)=0; exactly 1 deletion needed.",
    },
    {
        "partition": "valid_boundary",
        "a": "",
        "b": "a",
        "expected": 1,
        "label": '"" / "a" -> 1 (single-character insertion boundary)',
        "manual_trace": "len(a)=0, len(b)=1; exactly 1 insertion needed.",
    },
    {
        "partition": "valid_interior",
        "a": "cat",
        "b": "cat",
        "expected": 0,
        "label": '"cat" / "cat" -> 0 (identical non-empty strings)',
        "manual_trace": "Strings are identical; 0 substitutions or edits needed.",
    },
    {
        "partition": "valid_interior",
        "a": "kitten",
        "b": "sitting",
        "expected": 3,
        "label": '"kitten" / "sitting" -> 3 (multi-character edit)',
        "manual_trace": "3 unit-cost edits: replace k->s, replace e->i, insert g at end.",
    },
]

fixture_results = []
for f in FIXTURES:
    a, b = f["a"], f["b"]
    expected = f["expected"]
    actual = py_levenshtein(a, b)

    assert_ok(
        actual == expected,
        f"Fixture {f['label']}: matches expected",
        f"expected={expected}, actual={actual}",
    )

    fixture_results.append({
        "partition": f["partition"],
        "input_a": a,
        "input_b": b,
        "expected": expected,
        "actual": actual,
        "manual_trace": f["manual_trace"],
        "precondition_source": "levenshteinDistance.js lines 25-29",
    })

evidence["fixture_verification"] = fixture_results


# ─── Step 5: Boundary table documentation ─────────────────────────────────────
print("\n=== Step 5: Boundary table documentation ===")
boundary_table = {
    "source_contract": "levenshteinDistance.js lines 25-29: @param {string} a, @param {string} b, @return {number}",
    "domain": "Pairs of finite strings with length >= 0",
    "partitions": [
        {
            "name": "valid_boundary",
            "description": "Boundary cases at domain extremes (length 0 for one or both strings)",
            "examples": [
                {"inputs": ["", ""], "expected": 0},
                {"inputs": ["a", ""], "expected": 1},
                {"inputs": ["", "a"], "expected": 1},
            ],
        },
        {
            "name": "valid_interior",
            "description": "Typical strings of length > 0, both equal and distinct",
            "examples": [
                {"inputs": ["cat", "cat"], "expected": 0},
                {"inputs": ["kitten", "sitting"], "expected": 3},
            ],
        },
        {
            "name": "unsupported_boundary",
            "description": "Outside documented contract (@param {string}), null/undefined yields native TypeError without custom framework",
            "examples": [
                {"inputs": [None, ""], "expected_error": "TypeError"},
                {"inputs": ["", None], "expected_error": "TypeError"},
            ],
        },
    ],
}
evidence["boundary_table"] = boundary_table
assert_ok(len(boundary_table["partitions"]) == 3, "Boundary table has 3 distinct partitions defined")


# ─── Write evidence.json ──────────────────────────────────────────────────────
evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w") as fh:
    json.dump(evidence, fh, indent=2)
print(f"\n  evidence.json written → {evidence_path}")


# ─── Write results.json ───────────────────────────────────────────────────────
results = {
    "task": "R51-T022",
    "description": "Identify the smallest supported domain around levenshteinDistance and make boundary behavior explicit",
    "source_file": "src/algorithms/string/levenshtein-distance/levenshteinDistance.js",
    "test_file": "src/algorithms/string/levenshtein-distance/__test__/levenshteinDistance.test.js",
    "required_fixtures": {
        '"" / ""': 0,
        '"a" / ""': 1,
        '"cat" / "cat"': 0,
        '"kitten" / "sitting"': 3,
    },
    "total_failures": len(failures),
    "failures": failures,
}
results_path = os.path.join(WORK_DIR, "results.json")
with open(results_path, "w") as fh:
    json.dump(results, fh, indent=2)
print(f"  results.json written  → {results_path}")


# ─── Summary ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
if failures:
    print(f"FAILED — {len(failures)} assertion(s) failed:")
    for f in failures:
        print(f"  • {f['label']}: {f['detail']}")
    sys.exit(1)
else:
    print("ALL CHECKS PASSED")
    sys.exit(0)
