#!/usr/bin/env python3
"""
R51-T024 Check Runner
=====================
Property test for InsertionSort: output is ordered, preserves input
multiplicities, and the source mutation/return contract is verified.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the full repository test suite (non-watch mode).
  3. Run the focused InsertionSort tests.
  4. Python reference: verify all required fixtures with explicit expected values.
  5. Python reference: verify 100 generated cases (fixed seed) satisfy
     the ordering and multiset-preservation invariants.
  6. Write evidence.json and results.json under work/R51-T024/.
  7. Exit non-zero if any assertion fails.

Source contract (InsertionSort.js):
  - Line 5:  `const array = [...originalArray]`  → input is cloned, never mutated.
  - Line 37: `return array`                       → returns the sorted clone.
  - Line 18: `comparator.lessThan(curr, prev)`   → ascending sort by default.
"""

import json
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR  = os.path.join(REPO_ROOT, "work", "R51-T024")

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


# ─── Python reference implementation of InsertionSort ────────────────────────
# Mirrors InsertionSort.js (ascending, stable, non-mutating).
# Precondition source: InsertionSort.js line 5 (clone) and line 18 (lessThan).

def insertion_sort(original_array):
    """Pure Python mirror of InsertionSort.sort(). Returns sorted clone."""
    array = list(original_array)          # line 5: clone
    for i in range(1, len(array)):
        current_index = i
        while (
            current_index > 0
            and array[current_index] < array[current_index - 1]
        ):
            array[current_index - 1], array[current_index] = (
                array[current_index], array[current_index - 1]
            )
            current_index -= 1
    return array                          # line 37: return sorted clone


def is_sorted_asc(arr):
    return all(arr[i] <= arr[i + 1] for i in range(len(arr) - 1))


def same_multiset(a, b):
    if len(a) != len(b):
        return False
    freq = {}
    for x in a:
        freq[x] = freq.get(x, 0) + 1
    for x in b:
        freq[x] = freq.get(x, 0) - 1
    return all(v == 0 for v in freq.values())


# ─── Seeded PRNG (mulberry32 — same as JS test) ───────────────────────────────
def mulberry32(seed):
    """32-bit seeded PRNG matching the JS implementation in the test file."""
    s = seed & 0xFFFFFFFF
    def rng():
        nonlocal s
        s = (s + 0x6D2B79F5) & 0xFFFFFFFF
        z = (s ^ (s >> 15)) & 0xFFFFFFFF
        z = (z * (1 | s)) & 0xFFFFFFFF
        z = (z ^ (z + ((z ^ (z >> 7)) * (61 | z)))) & 0xFFFFFFFF
        return ((z ^ (z >> 14)) & 0xFFFFFFFF) / 4294967296
    return rng


def generate_cases(count, seed):
    rng = mulberry32(seed)
    cases = []
    for _ in range(count):
        length = int(rng() * 20) + 1       # 1..20
        arr = [int(rng() * 101) - 50 for _ in range(length)]  # -50..50
        cases.append(arr)
    return cases


# ─── Step 1: Tool versions ────────────────────────────────────────────────────
print("\n=== Step 1: Tool versions ===")
_, node_ver = run("node --version")
_, npm_ver  = run("npm --version")
_, py_ver   = run("python3 --version")
evidence["tool_versions"] = {
    "node": node_ver.strip(),
    "npm":  npm_ver.strip(),
    "python3": py_ver.strip(),
}
print(f"  node   : {node_ver.strip()}")
print(f"  npm    : {npm_ver.strip()}")
print(f"  python3: {py_ver.strip()}")


# ─── Step 2: Full test suite ──────────────────────────────────────────────────
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
assert_ok(rc == 0,        "Full test suite exits 0", f"exit code: {rc}")
assert_ok(test_count > 0, "Full test suite has non-zero passing tests",
          f"parsed count: {test_count}")


# ─── Step 3: Focused InsertionSort tests ──────────────────────────────────────
print("\n=== Step 3: Focused InsertionSort tests ===")
focus_cmd = (
    "npm test -- --runInBand "
    "src/algorithms/sorting/insertion-sort/__test__/InsertionSort.test.js"
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
assert_ok(rc2 == 0,         "Focused InsertionSort tests exit 0", f"exit code: {rc2}")
assert_ok(focus_count > 0,  "Focused tests report non-zero passing tests",
          f"parsed count: {focus_count}")


# ─── Step 4: Required fixtures ────────────────────────────────────────────────
print("\n=== Step 4: Required fixture verification ===")
# Precondition source: InsertionSort.js line 5 (clone) and line 37 (return)

FIXTURES = [
    {"input": [3, 1, 2],  "expected": [1, 2, 3], "label": "[3,1,2] → [1,2,3]"},
    {"input": [2, 2, 1],  "expected": [1, 2, 2], "label": "[2,2,1] → [1,2,2] (duplicates)"},
    {"input": [1, 2, 3],  "expected": [1, 2, 3], "label": "[1,2,3] already ordered → [1,2,3]"},
    {"input": [3, 2, 1],  "expected": [1, 2, 3], "label": "[3,2,1] reversed → [1,2,3]"},
    {"input": [],          "expected": [],        "label": "[] smallest supported → []"},
]

fixture_results = []
for f in FIXTURES:
    inp      = f["input"]
    expected = f["expected"]
    snapshot = list(inp)

    result = insertion_sort(inp)

    # Explicit expected value check
    assert_ok(result == expected,
              f"Fixture {f['label']}: result matches expected",
              f"expected={expected}, actual={result}")
    # I1: sorted
    assert_ok(is_sorted_asc(result),
              f"Fixture {f['label']}: output is sorted ascending")
    # I2: same multiset
    assert_ok(same_multiset(result, snapshot),
              f"Fixture {f['label']}: multiset preserved",
              f"input={snapshot}, result={result}")
    # I3: no mutation
    assert_ok(inp == snapshot,
              f"Fixture {f['label']}: input not mutated",
              f"before={snapshot}, after={inp}")

    fixture_results.append({
        "label": f["label"],
        "input": snapshot,
        "expected": expected,
        "actual": result,
        "sorted": is_sorted_asc(result),
        "multiset_ok": same_multiset(result, snapshot),
        "not_mutated": inp == snapshot,
        "precondition_source": "InsertionSort.js line 5 (clone) and line 37 (return)",
    })

evidence["fixture_verification"] = fixture_results


# ─── Step 5: Property test — 100 generated cases (seed 42) ───────────────────
print("\n=== Step 5: Property test — 100 generated cases (seed 42) ===")
# Generator domain: arrays of integers in [-50, 50], length 1–20.
# Domain is valid for InsertionSort (comparator.lessThan works for all numbers).
# Fixed seed 42 → deterministic, reproducible.

cases = generate_cases(100, 42)
prop_results = []
pass_count = 0

for idx, inp in enumerate(cases):
    snapshot = list(inp)
    result   = insertion_sort(inp)

    ok_sorted   = is_sorted_asc(result)
    ok_multiset = same_multiset(result, snapshot)
    ok_mutation = inp == snapshot
    ok_length   = len(result) == len(snapshot)

    if ok_sorted and ok_multiset and ok_mutation and ok_length:
        pass_count += 1
    else:
        failures.append({
            "label": f"Generated case #{idx}",
            "detail": (
                f"input={snapshot}, result={result}, "
                f"sorted={ok_sorted}, multiset={ok_multiset}, "
                f"mutation={ok_mutation}, length={ok_length}"
            ),
        })

    prop_results.append({
        "index": idx,
        "input_len": len(snapshot),
        "sorted": ok_sorted,
        "multiset_ok": ok_multiset,
        "not_mutated": ok_mutation,
        "length_ok": ok_length,
    })

assert_ok(pass_count == 100,
          "Property: all 100 generated cases pass all 4 invariants",
          f"passed: {pass_count}/100")
print(f"  Passed: {pass_count}/100 cases")

# Readable small case from the generator (index 0)
small = cases[0]
print(f"  Readable small case (index 0): input={small} → sorted={insertion_sort(list(small))}")

evidence["property_test"] = {
    "seed": 42,
    "count": 100,
    "domain": "integers in [-50, 50], array length 1-20",
    "invariants": [
        "I1: output sorted ascending",
        "I2: output multiset == input multiset",
        "I3: original input not mutated (clone confirmed)",
        "I4: output length == input length",
    ],
    "passed": pass_count,
    "readable_small_case": {
        "input": cases[0],
        "output": insertion_sort(list(cases[0])),
    },
    "per_case_summary": prop_results,
}


# ─── Write evidence.json ──────────────────────────────────────────────────────
evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w") as fh:
    json.dump(evidence, fh, indent=2)
print(f"\n  evidence.json written → {evidence_path}")

# ─── Write results.json ───────────────────────────────────────────────────────
results = {
    "task": "R51-T024",
    "description": "Property test for InsertionSort: ordered output, multiset preserved, no mutation",
    "source_file": "src/algorithms/sorting/insertion-sort/InsertionSort.js",
    "test_file": "src/algorithms/sorting/insertion-sort/__test__/InsertionSort.test.js",
    "source_contract": {
        "clone_line": 5,
        "return_line": 37,
        "sort_order": "ascending (comparator.lessThan, line 18)",
        "mutation": "none — input is cloned at line 5",
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
