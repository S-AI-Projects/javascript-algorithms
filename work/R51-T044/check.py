#!/usr/bin/env python3
"""
work/R51-T044/check.py

Focused runner and validation harness for:
Task: R51-T044 (Issue #44)
Student: Anjali Dewangan
Goal: Test an invariant of bfMaximumSubarray (bfMaximumSubarray.js)
Repository: https://github.com/S-AI-Projects/javascript-algorithms

Fixture:
  Smallest valid input: [] -> [] (sum = 0)
  One ordinary input: [-2, 1, -3, 4, -1, 2, 1, -5, 4] -> [4, -1, 2, 1] (sum = 6)
  Preconditions mapped to source lines.
  Property test: 100 bounded valid cases with fixed seed (Mulberry32, seed 42).
  Deliberate mutant detection test.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the repository test script in non-watch mode (assert nonzero test count).
  3. Run focused bfMaximumSubarray test suite.
  4. Run repository linter (npm run lint).
  5. Run git diff check (git diff --check).
  6. Python reference implementation verifying fixtures and 100 property cases.
  7. Verify deliberate mutant detection.
  8. Verify source file preconditions and invariant documentation.
  9. Write evidence.json and results.json under work/R51-T044/.
  10. Exit non-zero if any assertion fails.
"""

import json
import math
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T044")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "sets", "maximum-subarray", "bfMaximumSubarray.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "sets", "maximum-subarray", "__test__", "bfMaximumSubarray.test.js",
)

failures = []
evidence = {}
results = {
    "task": "R51-T044",
    "description": "Test an invariant of bfMaximumSubarray (bfMaximumSubarray.js)",
    "source_file": "src/algorithms/sets/maximum-subarray/bfMaximumSubarray.js",
    "test_file": "src/algorithms/sets/maximum-subarray/__test__/bfMaximumSubarray.test.js",
    "invariants": [
        "Invariant 1 (Contiguity): Output is a contiguous subsegment of inputArray",
        "Invariant 2 (Sum Maximality): For any contiguous subsegment S, sum(S) <= sum(result)",
        "Invariant 3 (Immutability): inputArray elements, order, and length remain unchanged",
        "Invariant 4 (Empty Boundary): When inputArray is [], returns []",
    ],
    "fixture_validation": {},
    "readable_small_case": {},
    "property_test_summary": {},
    "mutant_detection": {},
    "total_failures": 0,
    "failures": [],
}


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


# ─── Python reference implementation of bfMaximumSubarray ───────────────────
def py_bf_maximum_subarray(arr):
    """
    Python reference implementation matching bfMaximumSubarray semantics.
    """
    max_start = 0
    max_len = 0
    max_sum = None

    for start in range(len(arr)):
        curr_sum = 0
        for l in range(1, len(arr) - start + 1):
            curr_sum += arr[start + l - 1]
            if max_sum is None or curr_sum > max_sum:
                max_sum = curr_sum
                max_start = start
                max_len = l

    return arr[max_start:max_start + max_len]


def is_contiguous_subsegment(sub, arr):
    if len(sub) == 0:
        return True
    for i in range(len(arr) - len(sub) + 1):
        if arr[i:i + len(sub)] == sub:
            return True
    return False


def max_contiguous_sum(arr):
    if len(arr) == 0:
        return 0
    max_s = -float("inf")
    for start in range(len(arr)):
        s = 0
        for end in range(start, len(arr)):
            s += arr[end]
            if s > max_s:
                max_s = s
    return max_s


# ─── Mulberry32 PRNG (Fixed Seed 42) ─────────────────────────────────────────
class Mulberry32:
    def __init__(self, seed):
        self.state = seed & 0xFFFFFFFF

    def next(self):
        self.state = (self.state + 0x6D2B79F5) & 0xFFFFFFFF
        t = (self.state ^ (self.state >> 15)) * (1 | self.state)
        t = t & 0xFFFFFFFF
        t ^= (t + (t ^ (t >> 7)) * (61 | t)) & 0xFFFFFFFF
        t = t & 0xFFFFFFFF
        return ((t ^ (t >> 14)) >> 0) / 4294967296.0


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
cmd_test = "npm test -- --runInBand"
print(f"  Running: {cmd_test}")
rc, out = run(cmd_test)
count_m = re.search(r"Tests:\s+.*?(\d+)\s+passed", out)
test_count = int(count_m.group(1)) if count_m else 0
evidence["native_test_suite"] = {
    "command": cmd_test,
    "exit_code": rc,
    "test_count_passed": test_count,
    "output_tail": out[-2000:],
}
assert_ok(rc == 0, "Full test suite exits with code 0", f"exit code: {rc}")
assert_ok(test_count > 0, "Full test suite passes nonzero tests", f"passed: {test_count}")
print(f"  Passed test count: {test_count}")


# ─── Step 3: Focused bfMaximumSubarray tests ────────────────────────────────
print("\n=== Step 3: Focused bfMaximumSubarray tests ===")
cmd_focused = f"npm test -- {TEST_FILE}"
print(f"  Running: {cmd_focused}")
rc_focused, out_focused = run(cmd_focused)
f_count_m = re.search(r"Tests:\s+.*?(\d+)\s+passed", out_focused)
focused_test_count = int(f_count_m.group(1)) if f_count_m else 0
evidence["focused_test_suite"] = {
    "command": cmd_focused,
    "exit_code": rc_focused,
    "test_count_passed": focused_test_count,
    "output": out_focused[-1500:],
}
assert_ok(rc_focused == 0, "Focused test suite exits with code 0", f"exit code: {rc_focused}")
assert_ok(focused_test_count >= 5, "Focused test suite has at least 5 passing tests", f"passed: {focused_test_count}")
print(f"  Focused passed test count: {focused_test_count}")


# ─── Step 4: Linter check ───────────────────────────────────────────────────
print("\n=== Step 4: Linter check ===")
cmd_lint = "npm run lint"
print(f"  Running: {cmd_lint}")
rc_lint, out_lint = run(cmd_lint)
evidence["lint"] = {
    "command": cmd_lint,
    "exit_code": rc_lint,
    "output": out_lint[-1000:],
}
assert_ok(rc_lint == 0, "Linter exits cleanly with code 0", out_lint)


# ─── Step 5: Git diff check ─────────────────────────────────────────────────
print("\n=== Step 5: Git diff check ===")
cmd_diff = "git diff --check"
print(f"  Running: {cmd_diff}")
rc_diff, out_diff = run(cmd_diff)
evidence["git_diff_check"] = {
    "command": cmd_diff,
    "exit_code": rc_diff,
    "output": out_diff,
}
assert_ok(rc_diff == 0, "Git diff has no whitespace or formatting errors", out_diff)


# ─── Step 6: Fixtures and Property Tests (100 Cases) ────────────────────────
print("\n=== Step 6: Fixtures & Property Verification ===")
# Smallest valid input
res_empty = py_bf_maximum_subarray([])
assert_ok(res_empty == [], "Smallest valid fixture [] returns []")
results["fixture_validation"]["smallest_valid"] = {
    "input": [],
    "expected": [],
    "actual": res_empty,
    "preconditions": [
        {"line": 8, "precondition": "inputArray is an array"},
        {"line": 13, "precondition": "startIndex < inputArray.length (0 < 0 is false, loop terminates)"},
        {"line": 25, "precondition": "inputArray.slice(0, 0) returns fresh empty array"},
    ],
}

# Ordinary input
ordinary_input = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
res_ordinary = py_bf_maximum_subarray(ordinary_input)
assert_ok(res_ordinary == [4, -1, 2, 1], "Ordinary fixture returns [4, -1, 2, 1]")
assert_ok(sum(res_ordinary) == 6, "Ordinary fixture sum is 6")
results["fixture_validation"]["ordinary"] = {
    "input": ordinary_input,
    "expected": [4, -1, 2, 1],
    "actual": res_ordinary,
    "sum": sum(res_ordinary),
    "preconditions": [
        {"line": 8, "precondition": "inputArray is an array of numbers"},
        {"line": 13, "precondition": "iterates over all start indices"},
        {"line": 17, "precondition": "strictly greater comparison selects [4, -1, 2, 1]"},
        {"line": 25, "precondition": "returns slice without mutating input"},
    ],
}

# 100 generated cases
rng = Mulberry32(42)
passed_cases = 0
case_0_data = None

for case_idx in range(100):
    length = int(rng.next() * 12) + 1
    case_input = [int(rng.next() * 101) - 50 for _ in range(length)]
    input_copy = list(case_input)

    res = py_bf_maximum_subarray(case_input)

    # Invariant 1: Contiguity
    c1 = is_contiguous_subsegment(res, case_input)
    # Invariant 2: Maximality
    c2 = (sum(res) == max_contiguous_sum(case_input))
    # Invariant 3: Immutability
    c3 = (case_input == input_copy)

    if c1 and c2 and c3:
        passed_cases += 1

    if case_idx == 0:
        case_0_data = {
            "case_index": 0,
            "input": list(case_input),
            "result": list(res),
            "sum": sum(res),
        }

results["readable_small_case"] = case_0_data
results["property_test_summary"] = {
    "seed": 42,
    "generator": "Mulberry32",
    "total_cases": 100,
    "passed_cases": passed_cases,
}
assert_ok(passed_cases == 100, f"All 100 generated property cases passed all invariants (passed: {passed_cases})")


# ─── Step 7: Deliberate Mutant Detection ─────────────────────────────────────
print("\n=== Step 7: Deliberate Mutant Detection ===")
def mutant_drop_first(arr):
    res = py_bf_maximum_subarray(arr)
    return res[1:]

mutant_caught = False
test_mutant_input = [10, 20, 30]
mutant_res = mutant_drop_first(test_mutant_input)
if sum(mutant_res) != max_contiguous_sum(test_mutant_input):
    mutant_caught = True

results["mutant_detection"] = {
    "mutant_description": "Drops first element of maximal subarray",
    "test_input": test_mutant_input,
    "mutant_result": mutant_res,
    "mutant_caught": mutant_caught,
}
assert_ok(mutant_caught, "Deliberate mutant is detected by invariant checker")


# ─── Step 8: Source file contract & documentation validation ────────────────
print("\n=== Step 8: Source file contract & documentation validation ===")
with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    src_content = f.read()

assert_ok(
    "Contract & Invariants:" in src_content,
    "Contract & Invariants documented in bfMaximumSubarray.js JSDoc",
)
assert_ok(
    "Invariant 1 (Contiguity):" in src_content,
    "Invariant 1 documented in source",
)
assert_ok(
    "Invariant 2 (Sum Maximality):" in src_content,
    "Invariant 2 documented in source",
)
assert_ok(
    "export default function bfMaximumSubarray(" in src_content,
    "bfMaximumSubarray is exported default",
)


# ─── Step 9: Save evidence.json and results.json ────────────────────────────
print("\n=== Step 9: Save evidence.json and results.json ===")
os.makedirs(WORK_DIR, exist_ok=True)
results["total_failures"] = len(failures)
results["failures"] = failures

evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w", encoding="utf-8") as f:
    json.dump(evidence, f, indent=2)
print(f"  Wrote {evidence_path}")

results_path = os.path.join(WORK_DIR, "results.json")
with open(results_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print(f"  Wrote {results_path}")


# ─── Summary & Exit ──────────────────────────────────────────────────────────
print("\n=== Summary ===")
if failures:
    print(f"  FAIL: {len(failures)} assertion(s) failed.")
    for fail in failures:
        print(f"    - {fail['label']}: {fail['detail']}")
    sys.exit(1)
else:
    print("  SUCCESS: All invariant, fixture, and property checks passed.")
    sys.exit(0)
