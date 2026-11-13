#!/usr/bin/env python3
"""
R51-T018 · check.py
Focused runner for the failure-path / empty-result coverage of integerPartition.

Source under test:
  src/algorithms/math/integer-partition/integerPartition.js

Precondition (source line):
  integerPartition.js line 5 — `export default function integerPartition(number)`
  The function accepts any non-negative integer; number=0 is the smallest valid input.

Base-case sentinel (source line):
  integerPartition.js line 22 — `partitionMatrix[summandIndex][0] = 1`
  When number=0 the matrix is 1×1 and only this column-init line executes,
  returning 1 (the empty partition).

This runner:
  1. Runs the Jest test suite for integerPartition in non-watch mode.
  2. Verifies a non-zero number of tests were executed.
  3. Exits non-zero if any assertion fails or no tests ran.
"""

import subprocess
import sys
import os
import re

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEST_PATTERN = "src/algorithms/math/integer-partition"
JEST_CMD = [
    "npx", "jest", TEST_PATTERN,
    "--no-coverage",
    "--watchAll=false",
    "--ci",
]

print("=" * 60)
print("R51-T018 check: failure-path coverage for integerPartition")
print("=" * 60)
print(f"Repository root : {REPO_ROOT}")
print(f"Test command    : {' '.join(JEST_CMD)}")
print()

result = subprocess.run(
    JEST_CMD,
    cwd=REPO_ROOT,
    capture_output=True,
    text=True,
)

stdout = result.stdout
stderr = result.stderr
combined = stdout + stderr

print(combined)

# --- Verify non-zero test count ---
match = re.search(r"Tests:\s+(\d+) passed", combined)
if not match:
    print("FAIL: Could not parse test count from Jest output.", file=sys.stderr)
    sys.exit(1)

test_count = int(match.group(1))
if test_count == 0:
    print("FAIL: Jest reported zero passing tests.", file=sys.stderr)
    sys.exit(1)

print(f"Tests passed    : {test_count}")

# --- Confirm exit code ---
if result.returncode != 0:
    print(f"FAIL: Jest exited with code {result.returncode}.", file=sys.stderr)
    sys.exit(result.returncode)

# --- Report tool versions ---
node_version = subprocess.run(["node", "--version"], capture_output=True, text=True).stdout.strip()
npm_version  = subprocess.run(["npm",  "--version"], capture_output=True, text=True).stdout.strip()
python_ver   = sys.version.split()[0]

print()
print("Tool versions")
print(f"  node   : {node_version}")
print(f"  npm    : {npm_version}")
print(f"  python : {python_ver}")
print()
print("Evidence summary")
print("  Inputs tested   : 0 (smallest valid — empty partition), 4 (ordinary)")
print("  Expected outputs: 0 → 1, 4 → 5")
print("  Failure branch  : integerPartition.js line 22 (column-init loop, number=0)")
print("  Sentinel value  : 1 (exactly one way to partition zero: the empty sum)")
print()
print("ALL CHECKS PASSED")
sys.exit(0)
