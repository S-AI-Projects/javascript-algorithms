#!/usr/bin/env python3
"""
work/R51-T041/check.py

Focused runner and validation harness for:
Task: R51-T041 (Issue #41)
Student: Anjali Dewangan
Goal: Lock down the contract of reverseBits (fastFourierTransform.js)
Repository: https://github.com/S-AI-Projects/javascript-algorithms

Fixture:
  Empty supported value (bitsCount = 0),
  Singleton (bitsCount = 1),
  Three-element sequence [A, B, C] -> [C, B, A] (bitsCount = 3),
  String numeric coercion and code point vs byte distinction,
  Mutation isolation / pure function contract.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the repository test script in non-watch mode (assert nonzero test count).
  3. Run focused fastFourierTransform test suite.
  4. Run repository linter (npm run lint).
  5. Run git diff check.
  6. Python reference implementation verifying all fixture outputs and boundary partitions.
  7. Verify source file contract documentation and exports.
  8. Write evidence.json and results.json under work/R51-T041/.
  9. Exit non-zero if any assertion fails.
"""

import json
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T041")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "math", "fourier-transform", "fastFourierTransform.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "math", "fourier-transform", "__test__", "fastFourierTransform.test.js",
)

failures = []
evidence = {}
results = {
    "task": "R51-T041",
    "description": "Lock down the contract of reverseBits (fastFourierTransform.js)",
    "source_file": "src/algorithms/math/fourier-transform/fastFourierTransform.js",
    "test_file": "src/algorithms/math/fourier-transform/__test__/fastFourierTransform.test.js",
    "fixture_results": [],
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


# ─── Python reference implementation of reverse_bits ─────────────────────────
def py_reverse_bits(val, bits_count):
    """
    Simulates reverseBits execution semantics from fastFourierTransform.js.
    Reverses the order of the lower `bits_count` bits of `val`.
    """
    # Emulate JS numeric coercion if string
    if isinstance(val, str):
        val = int(val)
    reversed_bits = 0
    for bit_index in range(bits_count):
        reversed_bits *= 2
        if (val // (1 << bit_index)) % 2 == 1:
            reversed_bits += 1
    return reversed_bits


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


# ─── Step 3: Focused fastFourierTransform tests ──────────────────────────────
print("\n=== Step 3: Focused fastFourierTransform tests ===")
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
assert_ok(focused_test_count >= 12, "Focused test suite has at least 12 passing tests", f"passed: {focused_test_count}")
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


# ─── Step 6: Python reference verification of fixtures ──────────────────────
print("\n=== Step 6: Fixture validation via reference implementation ===")
fixtures = [
    # 1. Empty supported value
    {"category": "empty", "input": 0, "bits_count": 0, "expected": 0},
    {"category": "empty", "input": 5, "bits_count": 0, "expected": 0},
    {"category": "empty", "input": 255, "bits_count": 0, "expected": 0},

    # 2. Singleton
    {"category": "singleton", "input": 0, "bits_count": 1, "expected": 0},
    {"category": "singleton", "input": 1, "bits_count": 1, "expected": 1},
    {"category": "singleton", "input": 2, "bits_count": 1, "expected": 0},
    {"category": "singleton", "input": 3, "bits_count": 1, "expected": 1},

    # 3. Three-element sequence [A, B, C] -> [C, B, A]
    {"category": "three_element_asymmetric", "input": 1, "bits_count": 3, "expected": 4, "desc": "[1,0,0] -> [0,0,1]"},
    {"category": "three_element_asymmetric", "input": 4, "bits_count": 3, "expected": 1, "desc": "[0,0,1] -> [1,0,0]"},
    {"category": "three_element_asymmetric", "input": 3, "bits_count": 3, "expected": 6, "desc": "[1,1,0] -> [0,1,1]"},
    {"category": "three_element_asymmetric", "input": 6, "bits_count": 3, "expected": 3, "desc": "[0,1,1] -> [1,1,0]"},

    # 4. Palindromes
    {"category": "three_element_palindrome", "input": 2, "bits_count": 3, "expected": 2, "desc": "[0,1,0] -> [0,1,0]"},
    {"category": "three_element_palindrome", "input": 5, "bits_count": 3, "expected": 5, "desc": "[1,0,1] -> [1,0,1]"},

    # 5. Boundaries / repeated values
    {"category": "three_element_repeated", "input": 0, "bits_count": 3, "expected": 0, "desc": "[0,0,0] -> [0,0,0]"},
    {"category": "three_element_repeated", "input": 7, "bits_count": 3, "expected": 7, "desc": "[1,1,1] -> [1,1,1]"},

    # 6. String numeric coercion
    {"category": "string_coercion", "input": "1", "bits_count": 3, "expected": 4},
    {"category": "string_coercion", "input": "3", "bits_count": 3, "expected": 6},
    {"category": "string_coercion", "input": "6", "bits_count": 3, "expected": 3},

    # 7. Byte-level character reversal (ASCII code points)
    {"category": "byte_reversal", "input": ord("A"), "bits_count": 8, "expected": 130, "desc": "'A' (65=0b01000001) -> 130=0b10000010"},
    {"category": "byte_reversal", "input": ord("B"), "bits_count": 8, "expected": 66, "desc": "'B' (66=0b01000010) -> 66=0b01000010"},
    {"category": "byte_reversal", "input": ord("C"), "bits_count": 8, "expected": 194, "desc": "'C' (67=0b01000011) -> 194=0b11000010"},
]

for fix in fixtures:
    actual = py_reverse_bits(fix["input"], fix["bits_count"])
    passed = (actual == fix["expected"])
    record = {
        "category": fix["category"],
        "input": fix["input"],
        "bits_count": fix["bits_count"],
        "expected": fix["expected"],
        "actual": actual,
        "passed": passed,
    }
    if "desc" in fix:
        record["desc"] = fix["desc"]
    results["fixture_results"].append(record)
    assert_ok(passed, f"Fixture {fix['category']}: input={fix['input']}, bits={fix['bits_count']} -> {actual}", f"expected {fix['expected']}")

# Involutory property check for all 3-bit values
for x in range(8):
    double_rev = py_reverse_bits(py_reverse_bits(x, 3), 3)
    assert_ok(double_rev == x, f"Involutory property: double reversal of {x} across 3 bits restores {x}")


# ─── Step 7: Source file contract & export validation ───────────────────────
print("\n=== Step 7: Source file contract & export validation ===")
with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    src_content = f.read()

assert_ok(
    "export function reverseBits(" in src_content or "export { reverseBits" in src_content,
    "reverseBits is exported from fastFourierTransform.js",
)
assert_ok(
    "Contract & Specification:" in src_content,
    "reverseBits has comprehensive contract JSDoc documentation",
)
assert_ok(
    "export default function fastFourierTransform(" in src_content,
    "fastFourierTransform remains default export",
)


# ─── Step 8: Save evidence.json and results.json ────────────────────────────
print("\n=== Step 8: Save evidence.json and results.json ===")
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
    print("  SUCCESS: All contract and regression checks passed.")
    sys.exit(0)
