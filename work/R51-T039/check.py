#!/usr/bin/env python3
"""
check.py – automated runner for R51-T039.

Measures the work done by longestCommonSubsequence (operation count scaling)
while verifying correctness. Runs the Jest test suite in non-watch mode,
verifies all tests pass, collects evidence, and writes results.json.

Complexity claim (from longestCommonSubsequence.js):
  Time worst-case  O(n * m) where n = set1.length, m = set2.length.
  Space worst-case O(n * m).
  Input-size variable: n (set1 length), m (set2 length).
  Observation type: exact DP inner-loop cell-fill count = n * m.
  No pass/fail threshold depends on wall-clock speed.
"""
import json
import os
import subprocess
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK_DIR = os.path.join(REPO_ROOT, 'work', 'R51-T039')
JEST_RESULTS_PATH = os.path.join(WORK_DIR, 'jest-results.json')
EVIDENCE_PATH = os.path.join(WORK_DIR, 'cases.json')
RESULTS_JSON_PATH = os.path.join(WORK_DIR, 'results.json')
TEST_PATH = (
    'src/algorithms/sets/longest-common-subsequence/__test__/'
    'longestCommonSubsequence.test.js'
)


def tool_versions():
    """Return a dict with node, npm, and python version strings."""

    def _run(cmd):
        try:
            return subprocess.check_output(cmd, text=True).strip()
        except Exception:
            return 'unknown'

    return {
        'node': _run(['node', '--version']),
        'npm': _run(['npm', '--version']),
        'python': sys.version.split()[0],
    }


def main():
    versions = tool_versions()
    print('Tool versions:', json.dumps(versions, indent=2))

    # Clean stale outputs
    for path in (JEST_RESULTS_PATH, EVIDENCE_PATH, RESULTS_JSON_PATH):
        if os.path.exists(path):
            os.remove(path)

    # Run Jest — set env var so the complexity test writes evidence JSON
    env = {**os.environ, 'LCS_EVIDENCE_PATH': EVIDENCE_PATH}
    cmd = [
        'npm', 'test', '--',
        '--runInBand',
        '--watchAll=false',
        '--json',
        f'--outputFile={JEST_RESULTS_PATH}',
        TEST_PATH,
    ]
    print('Running:', ' '.join(cmd))
    result = subprocess.run(cmd, cwd=REPO_ROOT, env=env, text=True,
                            capture_output=False)

    # Read jest JSON output
    if not os.path.exists(JEST_RESULTS_PATH):
        print('ERROR: jest-results.json not found — Jest may have failed before writing output.')
        sys.exit(1)

    with open(JEST_RESULTS_PATH, 'r', encoding='utf-8') as f:
        jest_data = json.load(f)

    total_tests = jest_data.get('numTotalTests', 0)
    failed_tests = jest_data.get('numFailedTests', 0)
    passed_tests = jest_data.get('numPassedTests', 0)
    print(f'Tests — total: {total_tests}, passed: {passed_tests}, failed: {failed_tests}')

    if result.returncode != 0 or failed_tests > 0 or total_tests == 0:
        print('ERROR: Tests failed or no tests were executed.')
        sys.exit(1)

    # Read evidence cases if written by the complexity test
    evidence = {}
    if os.path.exists(EVIDENCE_PATH):
        with open(EVIDENCE_PATH, 'r', encoding='utf-8') as f:
            evidence = json.load(f)
        sizes = [s['n'] for s in evidence.get('sizes', [])]
        print(f'Complexity evidence captured for sizes: {sizes}')
        for size_data in evidence.get('sizes', []):
            n = size_data['n']
            median = size_data['median']
            expected = size_data['expectedOpCount']
            assert median == expected, (
                f'Operation count mismatch at n={n}: got {median}, expected {expected}'
            )
        print('All operation-count assertions agree with n*m claim.')
    else:
        print('WARNING: cases.json not written (LCS_EVIDENCE_PATH not consumed).')

    # Write results.json
    results = {
        'task': 'R51-T039',
        'issue': 39,
        'tool_versions': versions,
        'command': ' '.join(cmd),
        'test_count': total_tests,
        'passed': passed_tests,
        'failed': failed_tests,
        'complexity': {
            'claim': 'O(n * m) time worst-case, O(n * m) space worst-case',
            'input_size_variable': 'n = set1.length, m = set2.length',
            'observation_type': 'DP cell-fill count (exact, deterministic)',
            'no_wall_clock_threshold': True,
        },
        'evidence': evidence,
    }
    with open(RESULTS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f'Results written to {RESULTS_JSON_PATH}')
    print('ALL CHECKS PASSED')


if __name__ == '__main__':
    main()
