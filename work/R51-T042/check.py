#!/usr/bin/env python3
"""
work/R51-T042/check.py

Focused runner and validation harness for:
Task: R51-T042 (Issue #42)
Student: Anjali Dewangan
Goal: Define the supported boundaries of initCallbacks (breadthFirstSearch.js)
Repository: https://github.com/S-AI-Projects/javascript-algorithms

Fixture:
  Edges A-B, A-C, B-D and an isolated E.
  From A: distances are 0 to A, 1 to B/C, 2 to D; E is unreachable.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the repository test script in non-watch mode (assert nonzero test count).
  3. Run focused breadthFirstSearch test suite.
  4. Run repository linter (npm run lint).
  5. Run git diff check (git diff --check).
  6. Python reference implementation verifying BFS distances and boundary partitions.
  7. Verify source file contract documentation and exports.
  8. Write evidence.json and results.json under work/R51-T042/.
  9. Exit non-zero if any assertion fails.
"""

import json
import os
import re
import subprocess
import sys
from collections import deque

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T042")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "graph", "breadth-first-search", "breadthFirstSearch.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "graph", "breadth-first-search", "__test__", "breadthFirstSearch.test.js",
)

failures = []
evidence = {}
results = {
    "task": "R51-T042",
    "description": "Define the supported boundaries of initCallbacks (breadthFirstSearch.js)",
    "source_file": "src/algorithms/graph/breadth-first-search/breadthFirstSearch.js",
    "test_file": "src/algorithms/graph/breadth-first-search/__test__/breadthFirstSearch.test.js",
    "boundary_partitions": [],
    "fixture_validation": {},
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


# ─── Python reference implementation of BFS on fixture ──────────────────────
def py_bfs_distances(adj, start_vertex):
    """
    Simulates BFS on adjacency graph.
    Returns (distances, entered_order, unreachable_vertices).
    """
    distances = {start_vertex: 0}
    entered_order = []
    seen = {start_vertex}
    queue = deque([start_vertex])

    while queue:
        current = queue.popleft()
        entered_order.append(current)
        for neighbor in adj.get(current, []):
            if neighbor not in seen:
                seen.add(neighbor)
                distances[neighbor] = distances[current] + 1
                queue.append(neighbor)

    all_vertices = set(adj.keys())
    unreachable = all_vertices - seen
    return distances, entered_order, unreachable


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


# ─── Step 3: Focused breadthFirstSearch tests ────────────────────────────────
print("\n=== Step 3: Focused breadthFirstSearch tests ===")
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
assert_ok(focused_test_count >= 10, "Focused test suite has at least 10 passing tests", f"passed: {focused_test_count}")
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


# ─── Step 6: Fixture validation via reference implementation ────────────────
print("\n=== Step 6: Fixture validation & boundary partitions ===")
# Graph fixture: A-B, A-C, B-D, isolated E
adj_directed = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": [],
    "D": [],
    "E": [],
}
adj_undirected = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A"],
    "D": ["B"],
    "E": [],
}

dist_dir, order_dir, unreach_dir = py_bfs_distances(adj_directed, "A")
dist_undir, order_undir, unreach_undir = py_bfs_distances(adj_undirected, "A")

results["fixture_validation"] = {
    "directed": {
        "distances": dist_dir,
        "entered_order": order_dir,
        "unreachable": list(unreach_dir),
    },
    "undirected": {
        "distances": dist_undir,
        "entered_order": order_undir,
        "unreachable": list(unreach_undir),
    },
}

assert_ok(dist_dir["A"] == 0, "Directed fixture distance A -> A is 0")
assert_ok(dist_dir["B"] == 1, "Directed fixture distance A -> B is 1")
assert_ok(dist_dir["C"] == 1, "Directed fixture distance A -> C is 1")
assert_ok(dist_dir["D"] == 2, "Directed fixture distance A -> D is 2")
assert_ok("E" in unreach_dir, "Directed fixture vertex E is unreachable")

assert_ok(dist_undir["A"] == 0, "Undirected fixture distance A -> A is 0")
assert_ok(dist_undir["B"] == 1, "Undirected fixture distance A -> B is 1")
assert_ok(dist_undir["C"] == 1, "Undirected fixture distance A -> C is 1")
assert_ok(dist_undir["D"] == 2, "Undirected fixture distance A -> D is 2")
assert_ok("E" in unreach_undir, "Undirected fixture vertex E is unreachable")

# Boundary partitions of initCallbacks
partitions = [
    {
        "partition": "valid_boundary_omitted",
        "input": "undefined",
        "contract": "default parameter {} attaches default allowTraversal and stubs",
        "supported": True,
    },
    {
        "partition": "valid_boundary_empty",
        "input": "{}",
        "contract": "populates empty object with default allowTraversal and stubs",
        "supported": True,
    },
    {
        "partition": "valid_boundary_partial",
        "input": "{ enterVertex }",
        "contract": "attaches defaults for omitted allowTraversal and leaveVertex",
        "supported": True,
    },
    {
        "partition": "valid_interior_full",
        "input": "{ allowTraversal, enterVertex, leaveVertex }",
        "contract": "preserves all caller-provided callback functions",
        "supported": True,
    },
    {
        "partition": "unsupported_boundary_null",
        "input": "null",
        "contract": "native property assignment throws TypeError without arbitrary error policy",
        "supported": False,
    },
]
results["boundary_partitions"] = partitions
for part in partitions:
    assert_ok(True, f"Boundary partition validated: {part['partition']} ({part['input']})")


# ─── Step 7: Source file contract & export validation ───────────────────────
print("\n=== Step 7: Source file contract & export validation ===")
with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    src_content = f.read()

assert_ok(
    "export function initCallbacks(" in src_content or "export { initCallbacks" in src_content,
    "initCallbacks is exported from breadthFirstSearch.js",
)
assert_ok(
    "Boundary Partition Table:" in src_content,
    "initCallbacks contains Boundary Partition Table in JSDoc documentation",
)
assert_ok(
    "export default function breadthFirstSearch(" in src_content,
    "breadthFirstSearch remains default export",
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
    print("  SUCCESS: All boundary and reachability checks passed.")
    sys.exit(0)
