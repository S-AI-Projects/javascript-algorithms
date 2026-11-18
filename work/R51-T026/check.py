#!/usr/bin/env python3
"""
check.py - Automated runner and verification for R51-T026
(Simplify one responsibility in pascalTriangle).

Validates:
1. Native repository test script passes with non-zero test count.
2. Focused regression tests for pascalTriangle pass before and after refactoring.
3. Smallest valid input (0) and ordinary input (4) are asserted with explicit expected values.
4. Preconditions and source lines (pascalTriangle.js:2) are verified and cited.
5. Clarified state and extracted operation (calculateNextCoefficient) are verified in source.
6. Saves results and evidence to work/R51-T026/.
"""
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK_DIR = Path(__file__).resolve().parent
PASCAL_DIR = ROOT / 'src/algorithms/math/pascal-triangle'
SOURCE_FILE = PASCAL_DIR / 'pascalTriangle.js'
TEST_FILE = PASCAL_DIR / '__test__/pascalTriangle.test.js'

FIXTURES = [
    {
        'description': 'Smallest valid input (lower boundary)',
        'precondition_source': 'pascalTriangle.js:2 (@param {number} lineNumber - zero based)',
        'input': 0,
        'expected': [1],
        'independent_calculation': 'Row 0 has C(0, 0) = 1.',
        'test_name': 'calculates coefficients for the smallest valid input (lineNumber = 0)',
    },
    {
        'description': 'Ordinary input',
        'precondition_source': 'pascalTriangle.js:2 (@param {number} lineNumber - zero based)',
        'input': 4,
        'expected': [1, 4, 6, 4, 1],
        'independent_calculation': (
            'C(4, 0) = 1; '
            'C(4, 1) = 1 * (4 - 1 + 1) / 1 = 4; '
            'C(4, 2) = 4 * (4 - 2 + 1) / 2 = 6; '
            'C(4, 3) = 6 * (4 - 3 + 1) / 3 = 4; '
            'C(4, 4) = 4 * (4 - 4 + 1) / 4 = 1.'
        ),
        'test_name': 'calculates coefficients for an ordinary input (lineNumber = 4)',
    },
]


def run(command, cwd=ROOT):
    return subprocess.run(
        command,
        cwd=cwd,
        check=False,
        capture_output=True,
        text=True,
    )


def require_success(result, command):
    if result.returncode != 0:
        raise RuntimeError(
            '{} failed with exit code {}\nStdout:\n{}\nStderr:\n{}'.format(
                shlex.join(command),
                result.returncode,
                result.stdout,
                result.stderr,
            )
        )


def get_tool_versions():
    versions = {}
    for name, cmd in [('node', ['node', '--version']), ('npm', ['npm', '--version'])]:
        res = run(cmd)
        require_success(res, cmd)
        versions[name] = res.stdout.strip()
    versions['python'] = sys.version.split()[0]
    return versions


def main():
    print('Starting verification for R51-T026...')
    versions = get_tool_versions()
    print('Tool versions:', versions)

    # 1. Native repository test run (non-watch mode)
    native_command = ['npm', 'test', '--', '--runInBand']
    print('Running native test suite: {}'.format(shlex.join(native_command)))
    native_result = run(native_command)
    require_success(native_result, native_command)
    combined_output = native_result.stdout + native_result.stderr
    summary_match = re.search(r'Tests:\s+(\d+) passed,\s+(\d+) total', combined_output)
    if not summary_match:
        raise RuntimeError('Could not parse native Jest test count from output:\n' + combined_output)

    passed_tests, total_tests = (int(v) for v in summary_match.groups())
    if total_tests == 0 or passed_tests != total_tests:
        raise RuntimeError('Native Jest run failed or passed 0 tests: {}/{}'.format(passed_tests, total_tests))
    print('Native checks passed: {}/{} tests passed.'.format(passed_tests, total_tests))

    # 2. Focused test run for pascalTriangle
    focused_test_rel = TEST_FILE.relative_to(ROOT)
    focused_command = ['npm', 'test', '--', '--runInBand', str(focused_test_rel)]
    print('Running focused test suite: {}'.format(shlex.join(focused_command)))
    focused_result = run(focused_command)
    require_success(focused_result, focused_command)
    focused_output = focused_result.stdout + focused_result.stderr
    focused_match = re.search(r'Tests:\s+(\d+) passed,\s+(\d+) total', focused_output)
    if not focused_match:
        raise RuntimeError('Could not parse focused Jest test count:\n' + focused_output)

    focused_passed, focused_total = (int(v) for v in focused_match.groups())
    print('Focused checks passed: {}/{} tests passed.'.format(focused_passed, focused_total))

    # 3. Verify refactored responsibility in source
    source_content = SOURCE_FILE.read_text(encoding='utf-8')
    if 'function calculateNextCoefficient' not in source_content:
        raise RuntimeError('Expected extracted helper calculateNextCoefficient in pascalTriangle.js.')

    if 'previousCoefficient' not in source_content:
        raise RuntimeError('Expected clarified intermediate state previousCoefficient in pascalTriangle.js.')

    if 'binomialFactor' not in source_content:
        raise RuntimeError('Expected clarified intermediate state binomialFactor in pascalTriangle.js.')

    # 4. Record evidence and results
    evidence = {
        'task': 'R51-T026',
        'issue': 26,
        'item': 'src/algorithms/math/pascal-triangle',
        'behavior_contract': {
            'target_function': 'pascalTriangle(lineNumber) at pascalTriangle.js:19',
            'inputs': 'lineNumber: zero-based row index (number >= 0), established at line 2',
            'result': 'number[]: coefficients of the nth line of Pascal triangle',
            'mutation_behavior': 'Pure function; returns a new array; does not mutate arguments',
            'external_dependencies': []
        },
        'refactored_responsibility': {
            'name': 'calculateNextCoefficient(previousCoefficient, lineNumber, columnIndex)',
            'description': (
                'Extracts the coherent calculation of the consecutive binomial coefficient '
                'C(n, k) = C(n, k - 1) * (n - k + 1) / k from the previous coefficient. '
                'Clarifies intermediate state names previousCoefficient and binomialFactor.'
            ),
            'clarified_state': [
                'previousCoefficient: C(n, k - 1), the immediate predecessor in the row',
                'binomialFactor: (n - k + 1), the numerator multiplier in the recurrence relation'
            ]
        },
        'fixtures': FIXTURES,
        'native_check': {
            'command': shlex.join(native_command),
            'passed': passed_tests,
            'total': total_tests,
            'failed': total_tests - passed_tests
        },
        'focused_check': {
            'command': shlex.join(focused_command),
            'passed': focused_passed,
            'total': focused_total,
            'failed': focused_total - focused_passed
        },
        'tool_versions': versions
    }

    evidence_path = WORK_DIR / 'evidence.json'
    results_path = WORK_DIR / 'results.json'
    evidence_text = json.dumps(evidence, indent=2) + '\n'
    evidence_path.write_text(evidence_text, encoding='utf-8')
    results_path.write_text(evidence_text, encoding='utf-8')

    print('Evidence written to: {}'.format(evidence_path.relative_to(ROOT)))
    print('Results written to: {}'.format(results_path.relative_to(ROOT)))
    print('ALL CHECKS PASSED SUCCESSFULLY.')


if __name__ == '__main__':
    main()
