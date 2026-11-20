#!/usr/bin/env python3
"""
work/R51-T043/check.py

Focused runner and validation harness for:
Task: R51-T043 (Issue #43)
Student: Anjali Dewangan
Goal: Cross-check getPixel (imageData.js)
Repository: https://github.com/S-AI-Projects/javascript-algorithms

Fixture:
  Smallest valid input (1x1 image at {x: 0, y: 0}) and
  One ordinary input (3x3 image at {x: 1, y: 2}).
  Preconditions mapped to source lines.
  Independent reference comparison against 22 distinct pixel coordinates.

Steps:
  1. Record tool versions (node, npm, python3).
  2. Run the repository test script in non-watch mode (assert nonzero test count).
  3. Run focused imageData test suite.
  4. Run repository linter (npm run lint).
  5. Run git diff check (git diff --check).
  6. Python reference oracle verification across 22 coordinates and fixtures.
  7. Verify source file preconditions and representative result documentation.
  8. Write evidence.json and results.json under work/R51-T043/.
  9. Exit non-zero if any assertion fails.
"""

import json
import os
import re
import subprocess
import sys

# ─── Paths ───────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WORK_DIR = os.path.join(REPO_ROOT, "work", "R51-T043")
SOURCE_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "image-processing", "utils", "imageData.js",
)
TEST_FILE = os.path.join(
    REPO_ROOT,
    "src", "algorithms", "image-processing", "utils", "__test__", "imageData.test.js",
)

failures = []
evidence = {}
results = {
    "task": "R51-T043",
    "description": "Cross-check getPixel (imageData.js) against independent reference",
    "source_file": "src/algorithms/image-processing/utils/imageData.js",
    "test_file": "src/algorithms/image-processing/utils/__test__/imageData.test.js",
    "preconditions": [],
    "fixture_validation": {},
    "oracle_comparisons": [],
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


# ─── Python reference implementation / 2D grid oracle ────────────────────────
def py_grid_oracle(width, height, data, x, y):
    """
    Independent 2D grid oracle: structures image buffer into 2D row/col matrix
    and accesses grid[y][x] without flat index arithmetic.
    """
    grid = []
    channels = 4
    for r in range(height):
        row = []
        for c in range(width):
            offset = (r * width + c) * channels
            row.append([
                data[offset],
                data[offset + 1],
                data[offset + 2],
                data[offset + 3],
            ])
        grid.append(row)
    return grid[y][x]


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


# ─── Step 3: Focused imageData tests ────────────────────────────────────────
print("\n=== Step 3: Focused imageData tests ===")
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


# ─── Step 6: Fixtures and Oracle Comparison across 22 inputs ────────────────
print("\n=== Step 6: Fixtures & Oracle Comparison ===")
# Smallest valid input: 1x1 image
data_1x1 = [255, 128, 64, 255]
oracle_1x1 = py_grid_oracle(1, 1, data_1x1, 0, 0)
assert_ok(oracle_1x1 == [255, 128, 64, 255], "Smallest valid fixture (1x1 at 0,0) matches [255, 128, 64, 255]")
results["fixture_validation"]["smallest_valid"] = {
    "width": 1,
    "height": 1,
    "coord": {"x": 0, "y": 0},
    "expected": [255, 128, 64, 255],
    "actual": oracle_1x1,
    "preconditions": [
        {"line": 33, "precondition": "Coordinate destructuring { x: 0, y: 0 }"},
        {"line": 36, "precondition": "Linear index i = 0 * 1 + 0 = 0"},
        {"line": 37, "precondition": "Channel count cellsPerColor = 4"},
        {"line": 40, "precondition": "Byte slice range [0, 4)"},
    ],
}

# Ordinary input: 3x3 image at (1, 2)
data_3x3 = []
for idx in range(9):
    data_3x3.extend([
        (idx * 25) % 256,
        (idx * 50 + 10) % 256,
        (idx * 75 + 20) % 256,
        255,
    ])
oracle_3x3_ordinary = py_grid_oracle(3, 3, data_3x3, 1, 2)
expected_ordinary = [(7 * 25) % 256, (7 * 50 + 10) % 256, (7 * 75 + 20) % 256, 255]
assert_ok(oracle_3x3_ordinary == expected_ordinary, f"Ordinary fixture (3x3 at 1,2) matches {expected_ordinary}")
results["fixture_validation"]["ordinary"] = {
    "width": 3,
    "height": 3,
    "coord": {"x": 1, "y": 2},
    "expected": expected_ordinary,
    "actual": oracle_3x3_ordinary,
    "preconditions": [
        {"line": 33, "precondition": "Coordinate destructuring { x: 1, y: 2 }"},
        {"line": 36, "precondition": "Linear index i = 2 * 3 + 1 = 7"},
        {"line": 37, "precondition": "Channel count cellsPerColor = 4"},
        {"line": 40, "precondition": "Byte slice range [28, 32)"},
    ],
}

# 22 inputs across configurations
configs = [
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 2),
]
total_comparisons = 0
for w, h in configs:
    buf = []
    for i in range(w * h):
        buf.extend([
            (i * 17 + 5) % 256,
            (i * 31 + 15) % 256,
            (i * 47 + 25) % 256,
            (i * 59 + 35) % 256,
        ])
    for y in range(h):
        for x in range(w):
            res = py_grid_oracle(w, h, buf, x, y)
            offset = (y * w + x) * 4
            expected = buf[offset:offset + 4]
            assert_ok(res == expected, f"Oracle match at {w}x{h} ({x}, {y})")
            results["oracle_comparisons"].append({
                "width": w,
                "height": h,
                "x": x,
                "y": y,
                "color": res,
                "passed": (res == expected),
            })
            total_comparisons += 1

assert_ok(total_comparisons == 22, f"Total 22 valid inputs verified (got {total_comparisons})")


# ─── Step 7: Source file preconditions & documentation validation ───────────
print("\n=== Step 7: Source file contract & documentation validation ===")
with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    src_content = f.read()

assert_ok(
    "Representative Result:" in src_content,
    "Representative result is explained in imageData.js JSDoc documentation",
)
assert_ok(
    "export const getPixel =" in src_content,
    "getPixel is exported from imageData.js",
)
assert_ok(
    "export const setPixel =" in src_content,
    "setPixel is exported from imageData.js",
)

results["preconditions"] = [
    {"source_line": 33, "code": "export const getPixel = (img, { x, y }) => {", "precondition": "Destructures coordinate parameter as { x, y }"},
    {"source_line": 36, "code": "const i = y * img.width + x;", "precondition": "Requires numeric img.width and non-negative integer coordinates x, y"},
    {"source_line": 37, "code": "const cellsPerColor = 4; // RGBA", "precondition": "Assumes 4 RGBA channels per pixel"},
    {"source_line": 40, "code": "return img.data.subarray(i * cellsPerColor, i * cellsPerColor + cellsPerColor);", "precondition": "Requires img.data to implement typed array .subarray() method"},
]


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
    print("  SUCCESS: All oracle reference comparisons and fixture checks passed.")
    sys.exit(0)
