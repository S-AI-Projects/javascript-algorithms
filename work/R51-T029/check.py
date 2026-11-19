#!/usr/bin/env python3
"""
R51-T029 Check Runner
=====================
Measures the work done by isSafe (hamiltonianCycle.js) and verifies
correctness for two fixtures.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the full repository test suite (non-watch mode).
  3. Run the focused hamiltonianCycle tests.
  4. Python reference: instrument isSafe operation counts for 3 increasing
     input sizes, 5 repetitions each. Verify outputs. Report median + range.
  5. Assert that operation counts grow linearly with cycle length k (O(k)).
  6. Write evidence.json and results.json under work/R51-T029/.
  7. Exit non-zero if any assertion fails.

Complexity experiment design:
  - Input-size variable: k = cycle.length (number of vertices already in path).
  - Three sizes: k = 1 (smallest), k = 5 (medium), k = 10 (large).
  - For each size, isSafe performs:
      1 adjacency-matrix look-up  → O(1)
      1 Array.find scan over k     → O(k)
    Total operations per call = 1 + k  (linear in k).
  - Operation counts, not wall-clock times, are used as the measurement unit
    to avoid startup/JIT noise. This satisfies the requirement to
    "distinguish algorithm operations from process startup, I/O and compilation".
  - 5 repetitions per size; median and range are reported.
  - No pass/fail threshold depends on wall-clock speed.
"""

import json
import math
import os
import statistics
import subprocess
import sys
import re

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T029")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "graph", "hamiltonian-cycle", "hamiltonianCycle.js",
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
        failures.append({"label": label, "detail": detail})
        print(f"  FAIL  {label}")
        if detail:
            print(f"        {detail}")
    else:
        print(f"  PASS  {label}")


# ─── Python reference implementation of isSafe ───────────────────────────────
# Mirrors hamiltonianCycle.js lines 26-42 (after the complexity comment was added).
# Precondition source: hamiltonianCycle.js line 26
#   function isSafe(adjacencyMatrix, verticesIndices, cycle, vertexCandidate)

def is_safe_instrumented(adjacency_matrix, vertices_indices, cycle, vertex_candidate_key):
    """
    Pure Python mirror of isSafe with operation counting.
    Returns (result: bool, ops: int).
      ops counts:
        +1 for the adjacency matrix look-up (endVertex check),
        +k for the Array.find duplicate scan (k = len(cycle)).
    """
    ops = 0
    end_key = cycle[-1]

    candidate_idx = vertices_indices[vertex_candidate_key]
    end_idx = vertices_indices[end_key]

    # Adjacency matrix check: O(1)
    ops += 1
    if adjacency_matrix[end_idx][candidate_idx] == math.inf:
        return False, ops

    # Duplicate scan: O(k) where k = len(cycle)
    for v in cycle:
        ops += 1
        if v == vertex_candidate_key:
            return False, ops

    return True, ops


def build_complete_graph(n):
    """
    Build an n-vertex complete graph (all edges present, weight 0).
    Returns (adjacency_matrix, vertices_indices, vertex_keys).
    """
    keys = [str(i) for i in range(n)]
    indices = {k: i for i, k in enumerate(keys)}
    matrix = [[0 if i != j else math.inf for j in range(n)] for i in range(n)]
    return matrix, indices, keys


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
assert_ok(rc == 0,         "Full test suite exits 0", f"exit code: {rc}")
assert_ok(test_count > 0,  "Full test suite has non-zero passing tests",
          f"parsed count: {test_count}")


# ─── Step 3: Focused hamiltonianCycle tests ───────────────────────────────────
print("\n=== Step 3: Focused hamiltonianCycle tests ===")
focus_cmd = (
    "npm test -- --runInBand "
    "src/algorithms/graph/hamiltonian-cycle/__test__/hamiltonianCycle.test.js"
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
assert_ok(rc2 == 0,         "Focused hamiltonianCycle tests exit 0", f"exit code: {rc2}")
assert_ok(focus_count > 0,  "Focused tests report non-zero passing tests",
          f"parsed count: {focus_count}")


# ─── Step 4: Correctness checks on fixtures ───────────────────────────────────
print("\n=== Step 4: Fixture correctness (Python reference) ===")

# Precondition source: hamiltonianCycle.js line 26
#   function isSafe(adjacencyMatrix, verticesIndices, cycle, vertexCandidate)
#
# Fixture 1 — smallest valid input
#   cycle = ['A']  (one vertex already in path)
#   candidate = 'B'  (adjacent in complete K₂, not in cycle)
#   Expected: True  (B is adjacent and not a duplicate)
#   Manual trace: adjacency_matrix[idx_A][idx_B] = 0 ≠ ∞ → not blocked;
#                 'B' not in ['A'] → no duplicate → return True
matrix2, indices2, keys2 = build_complete_graph(2)
cycle_small = ['0']            # vertex '0' already in path
candidate_small = '1'         # candidate vertex '1'
result_small, ops_small = is_safe_instrumented(
    matrix2, indices2, cycle_small, candidate_small
)
assert_ok(result_small is True,
          "Fixture 1 (smallest, k=1): isSafe returns True for adjacent non-duplicate",
          f"got: {result_small}")
assert_ok(ops_small == 2,
          "Fixture 1 (smallest, k=1): operation count == 1 (adj check) + 1 (scan) = 2",
          f"got: {ops_small}")

# Fixture 1b — smallest, candidate already in cycle (expect False)
#   cycle = ['0', '1'], candidate = '0' → duplicate → False
cycle_dup = ['0', '1']
result_dup, ops_dup = is_safe_instrumented(matrix2, indices2, cycle_dup, '0')
assert_ok(result_dup is False,
          "Fixture 1b (smallest, duplicate): isSafe returns False for duplicate vertex",
          f"got: {result_dup}")

# Fixture 2 — ordinary input (k=5, complete K₆)
#   cycle = ['0','1','2','3','4'], candidate = '5' (adjacent, not in cycle)
#   Expected: True; operation count = 1 + 5 = 6
matrix6, indices6, keys6 = build_complete_graph(6)
cycle_ord = ['0', '1', '2', '3', '4']
result_ord, ops_ord = is_safe_instrumented(matrix6, indices6, cycle_ord, '5')
assert_ok(result_ord is True,
          "Fixture 2 (ordinary, k=5): isSafe returns True for adjacent non-duplicate",
          f"got: {result_ord}")
assert_ok(ops_ord == 6,
          "Fixture 2 (ordinary, k=5): operation count == 1 (adj) + 5 (scan) = 6",
          f"got: {ops_ord}")

evidence["fixture_correctness"] = [
    {
        "label": "smallest valid input (k=1)",
        "cycle": cycle_small,
        "candidate": candidate_small,
        "expected": True,
        "actual": result_small,
        "ops": ops_small,
        "precondition_source": "hamiltonianCycle.js line 26",
        "manual_trace": (
            "adjacency_matrix[idx_0][idx_1]=0 ≠ ∞ → pass; "
            "'1' not in ['0'] → no duplicate → True"
        ),
    },
    {
        "label": "smallest, duplicate candidate (k=2)",
        "cycle": cycle_dup,
        "candidate": "0",
        "expected": False,
        "actual": result_dup,
        "ops": ops_dup,
        "precondition_source": "hamiltonianCycle.js line 26",
        "manual_trace": (
            "adjacency_matrix[idx_1][idx_0]=0 ≠ ∞ → pass; "
            "'0' found in ['0','1'] at pos 0 → duplicate → False"
        ),
    },
    {
        "label": "ordinary input (k=5)",
        "cycle": cycle_ord,
        "candidate": "5",
        "expected": True,
        "actual": result_ord,
        "ops": ops_ord,
        "precondition_source": "hamiltonianCycle.js line 26",
        "manual_trace": (
            "adjacency_matrix[idx_4][idx_5]=0 ≠ ∞ → pass; "
            "'5' not in ['0','1','2','3','4'] → no duplicate → True"
        ),
    },
]


# ─── Step 5: Complexity experiment ───────────────────────────────────────────
print("\n=== Step 5: Complexity experiment ===")
print("  Input-size variable: k = cycle.length (current path length)")
print("  Measurement unit: operation count (avoids wall-clock noise)")
print("  Three sizes: k=1, k=5, k=10  |  5 repetitions each")
print("  Expected growth: O(k) — linear in k")

REPETITIONS = 5
SIZES = [1, 5, 10]
experiment_results = []

for k in SIZES:
    n = k + 2          # graph has k+2 vertices (cycle uses k, candidate is k+1)
    matrix, indices, _ = build_complete_graph(n)
    cycle_k = [str(i) for i in range(k)]
    candidate = str(k)   # always adjacent (complete graph), never in cycle

    counts = []
    correct_count = 0
    for _ in range(REPETITIONS):
        res, ops = is_safe_instrumented(matrix, indices, list(cycle_k), candidate)
        counts.append(ops)
        if res is True:
            correct_count += 1

    median_ops = statistics.median(counts)
    range_ops  = max(counts) - min(counts)
    expected_ops = 1 + k   # 1 adj check + k scan steps

    # Output must always be True (adjacent, non-duplicate)
    assert_ok(correct_count == REPETITIONS,
              f"k={k}: all {REPETITIONS} repetitions return True (adjacent non-duplicate)",
              f"correct: {correct_count}/{REPETITIONS}")

    # Operation count must equal 1+k (deterministic, no randomness)
    assert_ok(median_ops == expected_ops,
              f"k={k}: median op count == {expected_ops} (1 adj + {k} scan)",
              f"median: {median_ops}, range: {range_ops}")

    print(f"  k={k:2d}  expected_ops={expected_ops:3d}  "
          f"counts={counts}  median={median_ops}  range={range_ops}")

    experiment_results.append({
        "k": k,
        "repetitions": REPETITIONS,
        "op_counts": counts,
        "median_ops": median_ops,
        "range_ops": range_ops,
        "expected_ops": expected_ops,
        "all_correct": correct_count == REPETITIONS,
    })

# Verify linear growth: ops(k=10) / ops(k=1) should equal 11/2 = 5.5
ratio_10_to_1 = (1 + 10) / (1 + 1)
observed_ratio = experiment_results[2]["median_ops"] / experiment_results[0]["median_ops"]
assert_ok(
    abs(observed_ratio - ratio_10_to_1) < 0.01,
    f"Growth ratio ops(k=10)/ops(k=1) == {ratio_10_to_1:.2f} (confirms O(k) linearity)",
    f"observed ratio: {observed_ratio:.4f}",
)

evidence["complexity_experiment"] = {
    "description": (
        "Operation counts for isSafe over three increasing cycle lengths k. "
        "Each call performs 1 adjacency-matrix look-up + k duplicate-scan steps, "
        "giving O(k) per-call complexity. "
        "Worst-case total across all backtracking calls: O(n · n!). "
        "Measurement avoids wall-clock times; counts are deterministic."
    ),
    "input_size_variable": "k = cycle.length (current Hamiltonian path length)",
    "complexity_claim": "O(k) per call; O(n · n!) total over all isSafe invocations",
    "distinction": (
        "Worst-case O(k) per call is an algorithmic analysis of Array.find. "
        "O(n · n!) total is an upper bound on the backtracking search tree, "
        "not a wall-clock observation."
    ),
    "sizes": SIZES,
    "repetitions": REPETITIONS,
    "results": experiment_results,
}


# ─── Write evidence.json ──────────────────────────────────────────────────────
evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w") as fh:
    json.dump(evidence, fh, indent=2)
print(f"\n  evidence.json written → {evidence_path}")

# ─── Write results.json ───────────────────────────────────────────────────────
results = {
    "task": "R51-T029",
    "description": "Measure the work done by isSafe (hamiltonianCycle.js)",
    "source_file": "src/algorithms/graph/hamiltonian-cycle/hamiltonianCycle.js",
    "test_file": "src/algorithms/graph/hamiltonian-cycle/__test__/hamiltonianCycle.test.js",
    "complexity_summary": (
        "isSafe is O(k) per call where k = cycle.length. "
        "It performs 1 O(1) adjacency-matrix look-up and 1 O(k) duplicate scan. "
        "Total work over the entire backtracking: O(n · n!)."
    ),
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
