#!/usr/bin/env python3
"""
check.py – automated runner for R51-T035 (VisitMetadata repeatability tests).

Runs the graphBridges Jest test suite, verifies all tests pass,
collects evidence (jest JSON output + cases JSON), and writes results.json.
"""
import json
import os
import subprocess
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK_DIR = os.path.join(REPO_ROOT, 'work', 'R51-T035')
JEST_RESULTS_PATH = os.path.join(WORK_DIR, 'jest-results.json')
CASES_JSON_PATH = os.path.join(WORK_DIR, 'cases.json')
RESULTS_JSON_PATH = os.path.join(WORK_DIR, 'results.json')
TEST_PATH = 'src/algorithms/graph/bridges/__test__/graphBridges.test.js'


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
    for path in (JEST_RESULTS_PATH, CASES_JSON_PATH, RESULTS_JSON_PATH):
        if os.path.exists(path):
            os.remove(path)

    # Run Jest
    env = {**os.environ, 'VISIT_METADATA_EVIDENCE_PATH': CASES_JSON_PATH}
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

    # Read evidence cases if written
    cases = []
    if os.path.exists(CASES_JSON_PATH):
        with open(CASES_JSON_PATH, 'r', encoding='utf-8') as f:
            cases = json.load(f)
        print(f'Evidence cases captured: {len(cases)}')
    else:
        print('WARNING: cases.json not written (VISIT_METADATA_EVIDENCE_PATH not consumed).')

    # Write results.json
    results = {
        'task': 'R51-T035',
        'issue': 35,
        'tool_versions': versions,
        'command': ' '.join(cmd),
        'test_count': total_tests,
        'passed': passed_tests,
        'failed': failed_tests,
        'cases': cases,
    }
    with open(RESULTS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f'Results written to {RESULTS_JSON_PATH}')
    print('ALL CHECKS PASSED')


if __name__ == '__main__':
    main()
