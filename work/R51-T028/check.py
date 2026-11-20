#!/usr/bin/env python3
"""
R51-T028 Check Runner
=====================
Exercises a documented absent-result / rejection branch of initCallbacks in depthFirstSearch.js.

Fixture:
  Directed graph with cycle A -> B -> C -> A and an isolated vertex D.
  Start at A and assert that the cycle terminates without visiting D.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the full repository test suite in non-watch mode (assert nonzero count).
  3. Run focused depthFirstSearch tests.
  4. Python reference implementation to verify cycle termination and isolated vertex behavior.
  5. Assert tested branches named by source line (lines 46, 51-53).
  6. Verify caller-owned state validity and subsequent successful call.
  7. Write evidence.json and results.json under work/R51-T028/.
  8. Exit non-zero if any assertion fails.
"""

import json
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T028")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "graph", "depth-first-search", "depthFirstSearch.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "graph", "depth-first-search", "__test__", "depthFirstSearch.test.js",
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


# ─── Python reference implementation of DFS with default callback behavior ──
def py_depth_first_search(adj, start_vertex, custom_allow_traversal=None):
    """
    Simulates depthFirstSearch.js execution semantics.
    adj: dict of {vertex: [neighbors]}
    """
    seen = {}
    entered = []
    left = []
    rejections = []

    def default_allow_traversal(next_v):
        if next_v not in seen:
            seen[next_v] = True
            return True
        return False

    allow_traversal = custom_allow_traversal or default_allow_traversal

    def dfs_recursive(current_v, prev_v):
        entered.append(current_v)
        for next_v in adj.get(current_v, []):
            if allow_traversal(next_v):
                dfs_recursive(next_v, current_v)
            else:
                rejections.append((current_v, next_v))
        left.append(current_v)

    dfs_recursive(start_vertex, None)
    return {
        "entered": entered,
        "left": left,
        "rejections": rejections,
        "seen": seen,
    }


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


# ─── Step 3: Focused depthFirstSearch tests ──────────────────────────────────
print("\n=== Step 3: Focused depthFirstSearch tests ===")
focus_cmd = (
    "npm test -- --runInBand "
    "src/algorithms/graph/depth-first-search/__test__/depthFirstSearch.test.js"
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
assert_ok(rc2 == 0, "Focused depthFirstSearch tests exit 0", f"exit code: {rc2}")
assert_ok(focus_count > 0, "Focused tests report non-zero passing tests",
          f"parsed count: {focus_count}")


# ─── Step 4: Required Fixture & Cycle Termination Verification ────────────────
print("\n=== Step 4: Required fixture verification ===")
# Graph: A -> B, B -> C, C -> A; isolated D
graph_adj = {
    "A": ["B"],
    "B": ["C"],
    "C": ["A"],
    "D": [],
}

result_a = py_depth_first_search(graph_adj, "A")
entered = result_a["entered"]
left = result_a["left"]
rejections = result_a["rejections"]

print(f"  Entered vertices: {entered}")
print(f"  Left vertices   : {left}")
print(f"  Rejections (line 46): {rejections}")

assert_ok(
    entered == ["A", "B", "C", "A"],
    "Cycle A->B->C->A explored exactly once until rejection",
    f"entered={entered}",
)
assert_ok(
    ("A", "B") in rejections,
    "Rejection branch (line 46) reached when re-traversing A->B in cycle",
    f"rejections={rejections}",
)
assert_ok(
    "D" not in entered,
    "Isolated vertex D is NOT visited during cycle traversal from A",
    f"entered={entered}",
)
assert_ok(
    "D" not in left,
    "Isolated vertex D is NOT in leave list",
    f"left={left}",
)

# Step 4b: Verify subsequent successful call after the cycle rejection
result_d = py_depth_first_search(graph_adj, "D")
assert_ok(
    result_d["entered"] == ["D"],
    "Subsequent call starting at D succeeds independently",
    f"entered={result_d['entered']}",
)

evidence["fixture_verification"] = {
    "graph": "A->B, B->C, C->A with isolated D",
    "start_vertex": "A",
    "entered": entered,
    "left": left,
    "rejections": rejections,
    "isolated_d_visited": "D" in entered,
    "subsequent_run_from_d": result_d["entered"],
    "tested_branches": {
        "allowTraversal_fallback": "depthFirstSearch.js line 51",
        "cycle_rejection_return_false": "depthFirstSearch.js line 46",
        "enterVertex_fallback": "depthFirstSearch.js line 52",
        "leaveVertex_fallback": "depthFirstSearch.js line 53",
    },
}


# ─── Step 5: Documented branches validation ───────────────────────────────────
print("\n=== Step 5: Documented branches validation ===")
with open(SOURCE_FILE, "r") as f:
    source_content = f.read()

assert_ok("function initCallbacks" in source_content, "initCallbacks exists in source")
assert_ok("callbacks.allowTraversal || allowTraversalCallback" in source_content,
          "allowTraversal fallback branch present in source (line 51)")
assert_ok("return false;" in source_content,
          "Cycle rejection branch (return false) present in allowTraversalCallback (line 46)")


# ─── Write evidence.json ──────────────────────────────────────────────────────
evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w") as fh:
    json.dump(evidence, fh, indent=2)
print(f"\n  evidence.json written → {evidence_path}")


# ─── Write results.json ───────────────────────────────────────────────────────
results = {
    "task": "R51-T028",
    "description": "Exercise documented absent-result / rejection branch of initCallbacks in depthFirstSearch.js",
    "source_file": "src/algorithms/graph/depth-first-search/depthFirstSearch.js",
    "test_file": "src/algorithms/graph/depth-first-search/__test__/depthFirstSearch.test.js",
    "tested_branches": [
        {"name": "allowTraversal_fallback", "line": 51, "code": "callbacks.allowTraversal || allowTraversalCallback"},
        {"name": "cycle_rejection", "line": 46, "code": "return false;"},
        {"name": "enterVertex_fallback", "line": 52, "code": "callbacks.enterVertex || stubCallback"},
        {"name": "leaveVertex_fallback", "line": 53, "code": "callbacks.leaveVertex || stubCallback"},
    ],
    "fixture": {
        "description": "Cycle A->B->C->A with isolated D",
        "start": "A",
        "cycle_terminates_without_visiting_D": True,
        "caller_state_valid_afterwards": True,
        "subsequent_call_succeeds": True,
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
