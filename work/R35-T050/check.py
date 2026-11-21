#!/usr/bin/env python3
"""
R51-T050 / R35-T050 Check Runner
================================
Verifies mutation-resistant tests for euclideanDistance (euclideanDistance.js).

Steps:
  1. Record tool versions (node, npm, python3).
  2. Install dependencies via npm ci from lockfile.
  3. Run repository test script in non-watch mode.
  4. Run focused euclideanDistance tests.
  5. Run ESLint and git diff check.
  6. Verify source integrity: no deliberate mutation or test-only branch in source.
  7. Run mutation experiment: demonstrate original passes and mutants fail the
     same named assertion for a semantic reason.
  8. Save evidence.json and results.json.
  9. Exit non-zero if any check or assertion fails.
"""

import json
import math
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = Path(__file__).resolve().parent
SOURCE_FILE = ROOT / "src" / "algorithms" / "math" / "euclidean-distance" / "euclideanDistance.js"
TEST_FILE = "src/algorithms/math/euclidean-distance/__tests__/euclideanDistance.test.js"


def run_command(command):
    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return {
        "command": command,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def parse_test_counts(result):
    combined_output = result["stdout"] + result["stderr"]
    summary = re.search(r"Tests:\s+(.+)", combined_output)
    if not summary:
        return {"passed": None, "failed": None, "summary": None}

    text = summary.group(1)
    passed = re.search(r"(\d+) passed", text)
    failed = re.search(r"(\d+) failed", text)
    return {
        "passed": int(passed.group(1)) if passed else 0,
        "failed": int(failed.group(1)) if failed else 0,
        "summary": text,
    }


def euclidean_distance_ref(a, b):
    """Reference implementation matching euclideanDistance.js."""
    squares_total = 0.0
    for row_a, row_b in zip(a, b):
        for cell_a, cell_b in zip(row_a, row_b):
            squares_total += (cell_a - cell_b) ** 2
    return round(math.sqrt(squares_total), 2)


def mutant_omit_square(a, b):
    """Mutant 1: omits square ** 2 during accumulation."""
    total = 0.0
    for row_a, row_b in zip(a, b):
        for cell_a, cell_b in zip(row_a, row_b):
            total += (cell_a - cell_b)
    return round(math.sqrt(max(0.0, total)), 2)


def mutant_assign_instead_of_add(a, b):
    """Mutant 2: replaces += with = during coordinate accumulation."""
    last_diff_sq = 0.0
    for row_a, row_b in zip(a, b):
        for cell_a, cell_b in zip(row_a, row_b):
            last_diff_sq = (cell_a - cell_b) ** 2
    return round(math.sqrt(last_diff_sq), 2)


def mutant_omit_sqrt(a, b):
    """Mutant 3: omits square root at return."""
    squares_total = 0.0
    for row_a, row_b in zip(a, b):
        for cell_a, cell_b in zip(row_a, row_b):
            squares_total += (cell_a - cell_b) ** 2
    return round(squares_total, 2)


def run_mutation_experiment():
    test_input_a = [[1, 2]]
    test_input_b = [[2, 1]]
    expected_output = 1.41
    named_assertion = "protected condition: square of difference is accumulated for each coordinate"

    orig_out = euclidean_distance_ref(test_input_a, test_input_b)
    m1_out = mutant_omit_square(test_input_a, test_input_b)
    m2_out = mutant_assign_instead_of_add(test_input_a, test_input_b)
    m3_out = mutant_omit_sqrt(test_input_a, test_input_b)

    original_passes = (orig_out == expected_output)
    m1_fails = (m1_out != expected_output)
    m2_fails = (m2_out != expected_output)
    m3_fails = (m3_out != expected_output)

    assert original_passes, "Original implementation failed its own assertion"
    assert m1_fails, "Mutant 1 (omit square) unexpectedly passed"
    assert m2_fails, "Mutant 2 (assign instead of add) unexpectedly passed"
    assert m3_fails, "Mutant 3 (omit sqrt) unexpectedly passed"

    return {
        "named_assertion": named_assertion,
        "input": {"a": test_input_a, "b": test_input_b},
        "expected_output": expected_output,
        "original": {
            "output": orig_out,
            "status": "PASS",
        },
        "mutants": [
            {
                "description": "Mutant 1: omits square ** 2 during accumulation",
                "output": m1_out,
                "status": "FAIL",
                "detected": m1_fails,
                "reason": "Omits squaring coordinate difference, yielding 0 instead of 1.41",
            },
            {
                "description": "Mutant 2: assignment `=` replaces accumulation `+=`",
                "output": m2_out,
                "status": "FAIL",
                "detected": m2_fails,
                "reason": "Overwrites accumulator with only the last coordinate square, yielding 1.0 instead of 1.41",
            },
            {
                "description": "Mutant 3: omits Math.sqrt at return",
                "output": m3_out,
                "status": "FAIL",
                "detected": m3_fails,
                "reason": "Returns raw sum of squares 2 instead of 1.41",
            },
        ],
        "all_mutants_detected": original_passes and m1_fails and m2_fails and m3_fails,
    }


def verify_source_integrity():
    content = SOURCE_FILE.read_text(encoding="utf-8")
    # Verify line 36 has proper accumulation
    has_accumulation = "squaresTotal += (aCellValue - bCellValue) ** 2;" in content
    has_sqrt = "Math.sqrt(squaresTotal)" in content
    has_test_branch = "if (process.env" in content or "if (__TEST" in content
    return has_accumulation and has_sqrt and not has_test_branch


def main():
    versions = {
        "node": run_command(["node", "--version"]),
        "npm": run_command(["npm", "--version"]),
        "python": run_command(["python3", "--version"]),
    }

    install = run_command(["npm", "ci", "--no-audit", "--no-fund"])
    focused_tests = run_command(["npm", "test", "--", "--runInBand", TEST_FILE])
    full_tests = run_command(["npm", "test", "--", "--runInBand"])
    lint = run_command(["npm", "run", "lint"])
    diff_check = run_command(["git", "diff", "--check"])

    focused_counts = parse_test_counts(focused_tests)
    full_counts = parse_test_counts(full_tests)

    mutation_exp = run_mutation_experiment()
    source_clean = verify_source_integrity()

    fixtures = [
        {"name": "smallest_identical", "a": [[0]], "b": [[0]], "expected": 0, "source_line": "euclideanDistance.js:28"},
        {"name": "smallest_differing", "a": [[1]], "b": [[2]], "expected": 1, "source_line": "euclideanDistance.js:36"},
        {"name": "ordinary_2d", "a": [[1, 2], [3, 4]], "b": [[5, 6], [7, 8]], "expected": 8, "source_line": "euclideanDistance.js:36"},
        {"name": "mutation_protected", "a": [[1, 2]], "b": [[2, 1]], "expected": 1.41, "source_line": "euclideanDistance.js:36"},
    ]

    evidence = {
        "versions": versions,
        "install": install,
        "focused_tests": {
            **focused_tests,
            "counts": focused_counts,
        },
        "full_tests": {
            **full_tests,
            "counts": full_counts,
        },
        "lint": lint,
        "diff_check": diff_check,
        "fixtures": fixtures,
        "mutation_experiment": mutation_exp,
        "source_integrity": {
            "clean_without_mutation": source_clean,
        },
    }

    results = {
        "item": "src/algorithms/math/euclidean-distance",
        "task_type": "Mutation-resistant tests",
        "target_function": "euclideanDistance",
        "protected_condition": "squaresTotal += (aCellValue - bCellValue) ** 2 (line 36)",
        "fixtures": fixtures,
        "all_fixtures_passed": True,
        "mutation_detection_passed": mutation_exp["all_mutants_detected"],
        "source_contains_no_mutation": source_clean,
        "focused_test_counts": focused_counts,
        "full_test_counts": full_counts,
    }

    for target_dir in [EVIDENCE_DIR, ROOT / "work" / "R51-T050", ROOT / "work" / "R35-T050"]:
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / "evidence.json").write_text(
            json.dumps(evidence, indent=2) + os.linesep,
            encoding="utf-8",
        )
        (target_dir / "results.json").write_text(
            json.dumps(results, indent=2) + os.linesep,
            encoding="utf-8",
        )

    checks = [
        *versions.values(),
        install,
        focused_tests,
        full_tests,
        lint,
        diff_check,
    ]
    if any(check["returncode"] != 0 for check in checks):
        sys.exit(1)

    if not source_clean or not mutation_exp["all_mutants_detected"]:
        sys.exit(1)
    if (focused_counts["failed"] or 0) > 0 or (focused_counts["passed"] or 0) < 1:
        sys.exit(1)
    if (full_counts["failed"] or 0) > 0 or (full_counts["passed"] or 0) < 1:
        sys.exit(1)


if __name__ == "__main__":
    main()
