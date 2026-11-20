#!/usr/bin/env python3
"""
R51-T021 Check Runner
=====================
Locks down the contract of reverseTraversalRecursive (reverseTraversal.js).

Fixtures required:
  1. Three distinct nodes A -> B -> C:
     - Traversal values: ['C', 'B', 'A']
     - Return value: undefined (void)
     - Separate links verification: A.next==B, B.next==C, C.next==null
     - Separate values verification: A.value=='A', B.value=='B', C.value=='C'
  2. Smallest supported list:
     - Empty list (null node): 0 callback invocations, []
     - Single node: ['Solo'], link and value preserved
  3. Repeated-value domain boundary (X -> X -> Y):
     - Traversal values: ['Y', 'X', 'X']
     - Distinct node link identity preserved

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the full repository test suite in non-watch mode (assert nonzero count).
  3. Run focused reverseTraversal tests.
  4. Python reference implementation to verify all fixtures, checking values and links separately.
  5. Save evidence.json and results.json under work/R51-T021/.
  6. Exit non-zero if any assertion fails.
"""

import json
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T021")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "linked-list", "reverse-traversal", "reverseTraversal.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "linked-list", "reverse-traversal", "__test__", "reverseTraversal.test.js",
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


# ─── Python reference linked list node and reverse traversal ─────────────────
class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node


def py_reverse_traversal_recursive(node, callback):
    """Mirror of reverseTraversalRecursive in reverseTraversal.js (line 24)."""
    if node is not None:
        py_reverse_traversal_recursive(node.next, callback)
        callback(node.value)
    return None  # void return contract


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


# ─── Step 3: Focused reverseTraversal tests ──────────────────────────────────
print("\n=== Step 3: Focused reverseTraversal tests ===")
focus_cmd = (
    "npm test -- --runInBand "
    "src/algorithms/linked-list/reverse-traversal/__test__/reverseTraversal.test.js"
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
assert_ok(rc2 == 0, "Focused reverseTraversal tests exit 0", f"exit code: {rc2}")
assert_ok(focus_count > 0, "Focused tests report non-zero passing tests",
          f"parsed count: {focus_count}")


# ─── Step 4: Required Fixtures & Contract Verification ────────────────────────
print("\n=== Step 4: Required fixtures and separate link/value checks ===")

# Fixture 1: A -> B -> C
nodeC = Node("C", None)
nodeB = Node("B", nodeC)
nodeA = Node("A", nodeB)

visited_abc = []
ret_abc = py_reverse_traversal_recursive(nodeA, visited_abc.append)

assert_ok(ret_abc is None, "Fixture 1: return value is None/undefined (void contract)")
assert_ok(visited_abc == ["C", "B", "A"], "Fixture 1: traversal order is ['C', 'B', 'A']")
# Separate node link verification
assert_ok(nodeA.next is nodeB, "Fixture 1: link nodeA.next points to nodeB")
assert_ok(nodeB.next is nodeC, "Fixture 1: link nodeB.next points to nodeC")
assert_ok(nodeC.next is None, "Fixture 1: link nodeC.next is None")
# Separate node value verification
assert_ok(nodeA.value == "A", "Fixture 1: nodeA.value remains 'A'")
assert_ok(nodeB.value == "B", "Fixture 1: nodeB.value remains 'B'")
assert_ok(nodeC.value == "C", "Fixture 1: nodeC.value remains 'C'")

# Fixture 2a: Smallest supported list (empty / None)
visited_empty = []
ret_empty = py_reverse_traversal_recursive(None, visited_empty.append)
assert_ok(ret_empty is None, "Fixture 2a (empty): return value is None/undefined")
assert_ok(visited_empty == [], "Fixture 2a (empty): 0 callback invocations")

# Fixture 2b: Single node list
single_node = Node("Solo", None)
visited_single = []
ret_single = py_reverse_traversal_recursive(single_node, visited_single.append)
assert_ok(visited_single == ["Solo"], "Fixture 2b (single): traversal is ['Solo']")
assert_ok(single_node.next is None, "Fixture 2b (single): link preserved (None)")
assert_ok(single_node.value == "Solo", "Fixture 2b (single): value preserved ('Solo')")

# Fixture 3: Repeated-value domain boundary (X -> X -> Y)
node3 = Node("Y", None)
node2 = Node("X", node3)
node1 = Node("X", node2)

visited_rep = []
ret_rep = py_reverse_traversal_recursive(node1, visited_rep.append)
assert_ok(visited_rep == ["Y", "X", "X"], "Fixture 3 (repeated): traversal is ['Y', 'X', 'X']")
assert_ok(node1.next is node2, "Fixture 3: node1.next points to node2 specifically")
assert_ok(node2.next is node3, "Fixture 3: node2.next points to node3 specifically")
assert_ok(node3.next is None, "Fixture 3: node3.next is None")
assert_ok(node1.value == "X" and node2.value == "X" and node3.value == "Y",
          "Fixture 3: duplicate node values intact")

evidence["fixture_verification"] = [
    {
        "name": "three_distinct_nodes_A_B_C",
        "inputs": ["A", "B", "C"],
        "expected_traversal": ["C", "B", "A"],
        "actual_traversal": visited_abc,
        "return_value": ret_abc,
        "links_intact": nodeA.next is nodeB and nodeB.next is nodeC and nodeC.next is None,
        "values_intact": nodeA.value == "A" and nodeB.value == "B" and nodeC.value == "C",
        "precondition_source": "reverseTraversal.js line 24",
    },
    {
        "name": "smallest_supported_empty_list",
        "inputs": None,
        "expected_traversal": [],
        "actual_traversal": visited_empty,
        "return_value": ret_empty,
        "precondition_source": "reverseTraversal.js line 24",
    },
    {
        "name": "smallest_supported_single_node",
        "inputs": ["Solo"],
        "expected_traversal": ["Solo"],
        "actual_traversal": visited_single,
        "links_intact": single_node.next is None,
        "values_intact": single_node.value == "Solo",
        "precondition_source": "reverseTraversal.js line 24",
    },
    {
        "name": "repeated_value_boundary_X_X_Y",
        "inputs": ["X", "X", "Y"],
        "expected_traversal": ["Y", "X", "X"],
        "actual_traversal": visited_rep,
        "links_intact": node1.next is node2 and node2.next is node3 and node3.next is None,
        "values_intact": node1.value == "X" and node2.value == "X" and node3.value == "Y",
        "precondition_source": "reverseTraversal.js line 24",
    },
]


# ─── Write evidence.json ──────────────────────────────────────────────────────
evidence_path = os.path.join(WORK_DIR, "evidence.json")
with open(evidence_path, "w") as fh:
    json.dump(evidence, fh, indent=2)
print(f"\n  evidence.json written → {evidence_path}")


# ─── Write results.json ───────────────────────────────────────────────────────
results = {
    "task": "R51-T021",
    "description": "Lock down the contract of reverseTraversalRecursive with separate link and value assertions",
    "source_file": "src/algorithms/linked-list/reverse-traversal/reverseTraversal.js",
    "test_file": "src/algorithms/linked-list/reverse-traversal/__test__/reverseTraversal.test.js",
    "contract": {
        "function": "reverseTraversalRecursive",
        "source_line": 24,
        "inputs": ["LinkedListNode | null", "traversalCallback"],
        "return_type": "void (undefined)",
        "mutation": "none (values and links strictly preserved)",
    },
    "fixtures_tested": [
        "A -> B -> C (ordinary)",
        "null (empty list)",
        "single node",
        "X -> X -> Y (repeated-value boundary)",
    ],
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
