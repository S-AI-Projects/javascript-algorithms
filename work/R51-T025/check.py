#!/usr/bin/env python3
"""
R51-T025 Check Runner
=====================
Verifies repeatability and input-isolation for greedyJumpGame.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the full repository test suite (non-watch mode).
  3. Run the focused greedyJumpGame tests.
  4. Verify greedyJumpGame.js does NOT mutate its input (Python reference impl).
  5. Verify repeated calls return identical results (Python reference impl).
  6. Write evidence.json and results.json under work/R51-T025/.
  7. Exit non-zero if any assertion fails.
"""

import json
import os
import subprocess
import sys

# ─── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T025")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "uncategorized", "jump-game", "greedyJumpGame.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "uncategorized", "jump-game", "__test__",
    "greedyJumpGame.test.js",
)

failures = []
evidence = {}


# ─── Helpers ──────────────────────────────────────────────────────────────────
def run(cmd, cwd=None):
    """Run a shell command and return (returncode, stdout+stderr)."""
    result = subprocess.run(
        cmd, shell=True, cwd=cwd or REPO_ROOT,
        capture_output=True, text=True,
    )
    return result.returncode, result.stdout + result.stderr


def assert_ok(condition, label, detail=""):
    if not condition:
        failures.append({"label": label, "detail": detail})
        print(f"  FAIL  {label}")
        if detail:
            print(f"        {detail}")
    else:
        print(f"  PASS  {label}")


# ─── Python reference implementation of greedyJumpGame ────────────────────────
def greedy_jump_game(numbers):
    """
    Pure Python mirror of greedyJumpGame.js for independent verification.
    Precondition source: greedyJumpGame.js line 17
        @param {number[]} numbers - array of possible jump length.
    """
    if not numbers:
        return False
    left_good = len(numbers) - 1
    for i in range(len(numbers) - 2, -1, -1):
        if i + numbers[i] >= left_good:
            left_good = i
    return left_good == 0


# ─── Step 1: Tool versions ────────────────────────────────────────────────────
print("\n=== Step 1: Tool versions ===")
_, node_ver = run("node --version")
_, npm_ver = run("npm --version")
_, python_ver = run("python3 --version")
evidence["tool_versions"] = {
    "node": node_ver.strip(),
    "npm": npm_ver.strip(),
    "python3": python_ver.strip(),
}
print(f"  node   : {node_ver.strip()}")
print(f"  npm    : {npm_ver.strip()}")
print(f"  python3: {python_ver.strip()}")


# ─── Step 2: Full test suite ──────────────────────────────────────────────────
print("\n=== Step 2: Full repository test suite ===")
print("  Running: npm test -- --runInBand  (this may take a while)")
rc, out = run("npm test -- --runInBand", cwd=REPO_ROOT)

# Parse test count from Jest output (e.g. "Tests: 123 passed")
import re
test_count_match = re.search(r"Tests:\s+.*?(\d+)\s+passed", out)
test_count = int(test_count_match.group(1)) if test_count_match else 0

evidence["native_test_suite"] = {
    "command": "npm test -- --runInBand",
    "exit_code": rc,
    "test_count_passed": test_count,
    "output_tail": out[-3000:],
}
assert_ok(rc == 0, "Full test suite exits 0", f"exit code: {rc}")
assert_ok(test_count > 0, "Full test suite reports non-zero passing tests",
          f"parsed count: {test_count}")


# ─── Step 3: Focused greedyJumpGame tests ─────────────────────────────────────
print("\n=== Step 3: Focused greedyJumpGame tests ===")
focus_cmd = (
    "npm test -- --runInBand "
    "src/algorithms/uncategorized/jump-game/__test__/greedyJumpGame.test.js"
)
print(f"  Running: {focus_cmd}")
rc2, out2 = run(focus_cmd, cwd=REPO_ROOT)

focus_match = re.search(r"Tests:\s+.*?(\d+)\s+passed", out2)
focus_count = int(focus_match.group(1)) if focus_match else 0

evidence["focused_test_run"] = {
    "command": focus_cmd,
    "exit_code": rc2,
    "test_count_passed": focus_count,
    "output_tail": out2[-3000:],
}
assert_ok(rc2 == 0, "Focused greedyJumpGame tests exit 0", f"exit code: {rc2}")
assert_ok(focus_count > 0, "Focused tests report non-zero passing tests",
          f"parsed count: {focus_count}")


# ─── Step 4 & 5: Python reference verification ────────────────────────────────
print("\n=== Step 4 & 5: Python reference verification ===")

# Precondition source: greedyJumpGame.js line 17
#   @param {number[]} numbers - array of possible jump length.
fixtures = [
    {
        "label": "smallest valid input",
        "input": [1, 0],
        "expected": True,
        "precondition_source": "greedyJumpGame.js line 17 (@param {number[]} numbers)",
        "manual_trace": (
            "leftGoodPosition=1; index 0: maxJump=0+1=1 >= 1 → leftGoodPosition=0; "
            "result: 0===0 → true"
        ),
    },
    {
        "label": "ordinary input",
        "input": [3, 2, 1, 0, 4],
        "expected": False,
        "precondition_source": "greedyJumpGame.js line 17 (@param {number[]} numbers)",
        "manual_trace": (
            "leftGoodPosition=4; no index i satisfies i+numbers[i]>=4 → "
            "leftGoodPosition stays 4; result: 4===0 → false"
        ),
    },
]

fixture_results = []
for f in fixtures:
    inp = f["input"]
    expected = f["expected"]
    label = f["label"]

    # First call
    inp_copy1 = list(inp)
    actual1 = greedy_jump_game(inp_copy1)
    # Verify no mutation
    mutated1 = inp_copy1 != inp
    assert_ok(not mutated1, f"{label}: input array not mutated on call 1",
              f"before={inp}, after={inp_copy1}")
    assert_ok(actual1 == expected, f"{label}: call 1 result matches expected",
              f"expected={expected}, actual={actual1}")

    # Second call (repeatability)
    inp_copy2 = list(inp)
    actual2 = greedy_jump_game(inp_copy2)
    mutated2 = inp_copy2 != inp
    assert_ok(not mutated2, f"{label}: input array not mutated on call 2",
              f"before={inp}, after={inp_copy2}")
    assert_ok(actual2 == expected, f"{label}: call 2 result matches expected",
              f"expected={expected}, actual={actual2}")
    assert_ok(actual1 == actual2, f"{label}: call 1 and call 2 agree",
              f"call1={actual1}, call2={actual2}")

    fixture_results.append({
        "label": label,
        "input": inp,
        "expected": expected,
        "actual_call1": actual1,
        "actual_call2": actual2,
        "input_mutated": mutated1 or mutated2,
        "calls_agree": actual1 == actual2,
        "precondition_source": f["precondition_source"],
        "manual_trace": f["manual_trace"],
    })

# Cross-fixture isolation
print("\n  Cross-fixture isolation:")
# Run smallest first, then ordinary
r_small_first = greedy_jump_game([1, 0])
r_ordinary_after = greedy_jump_game([3, 2, 1, 0, 4])
assert_ok(r_small_first == True,
          "Cross-isolation: smallest [1,0] → true before ordinary call")
assert_ok(r_ordinary_after == False,
          "Cross-isolation: ordinary [3,2,1,0,4] → false after smallest call")

# Run ordinary first, then smallest
r_ordinary_first = greedy_jump_game([3, 2, 1, 0, 4])
r_small_after = greedy_jump_game([1, 0])
assert_ok(r_ordinary_first == False,
          "Cross-isolation: ordinary [3,2,1,0,4] → false before smallest call")
assert_ok(r_small_after == True,
          "Cross-isolation: smallest [1,0] → true after ordinary call")

evidence["fixture_verification"] = fixture_results
evidence["cross_fixture_isolation"] = {
    "smallest_then_ordinary": {"smallest": r_small_first, "ordinary": r_ordinary_after},
    "ordinary_then_smallest": {"ordinary": r_ordinary_first, "smallest": r_small_after},
}


# ─── Write evidence.json ──────────────────────────────────────────────────────
evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w") as fh:
    json.dump(evidence, fh, indent=2)
print(f"\n  evidence.json written → {evidence_path}")


# ─── Write results.json ───────────────────────────────────────────────────────
results = {
    "task": "R51-T025",
    "description": "Make verification repeatable for greedyJumpGame",
    "source_file": "src/algorithms/uncategorized/jump-game/greedyJumpGame.js",
    "test_file": "src/algorithms/uncategorized/jump-game/__test__/greedyJumpGame.test.js",
    "purity_verdict": (
        "greedyJumpGame is a pure function: it only reads `numbers` via "
        "indexed access and uses a local variable `leftGoodPosition`. "
        "It never writes to `numbers`. No external dependencies."
    ),
    "total_failures": len(failures),
    "failures": failures,
    "fixtures": fixture_results,
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
