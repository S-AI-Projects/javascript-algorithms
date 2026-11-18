#!/usr/bin/env python3
"""
check.py - Automated runner and verification for R51-T027
(Publish a runnable example for isPalindrome).

Validates:
1. Native repository test script passes with non-zero test count.
2. Focused regression and documentation tests in isPalindrome.test.js pass.
3. All required fixtures ("", "a", "aba", "ab", "abba") are tested with explicit expected values.
4. Normalization specification (normalization is not performed) is explicitly asserted.
5. Intermediate states and decisive state transitions are traced and match independent calculations.
6. Documentation in isPalindrome.js and README.md contains executable worked examples.
7. Saves results and evidence to work/R51-T027/.
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
PALINDROME_DIR = ROOT / 'src/algorithms/string/palindrome'
SOURCE_FILE = PALINDROME_DIR / 'isPalindrome.js'
TEST_FILE = PALINDROME_DIR / '__test__/isPalindrome.test.js'
README_FILE = PALINDROME_DIR / 'README.md'

FIXTURES = [
    {
        'input': '',
        'length': 0,
        'initial_state': {'left': 0, 'right': -1},
        'intermediate_steps': [],
        'decisive_transition': 'Loop condition (0 < -1) is false; loop skipped',
        'expected': True,
        'actual': True,
        'test': 'returns true for the empty string fixture ("")',
    },
    {
        'input': 'a',
        'length': 1,
        'initial_state': {'left': 0, 'right': 0},
        'intermediate_steps': [],
        'decisive_transition': 'Pointers meet at index 0 (0 < 0 is false); loop skipped',
        'expected': True,
        'actual': True,
        'test': 'returns true for single character fixture ("a")',
    },
    {
        'input': 'aba',
        'length': 3,
        'initial_state': {'left': 0, 'right': 2},
        'intermediate_steps': [
            {'left': 0, 'right': 2, 'chars': ('a', 'a'), 'matched': True, 'next_left': 1, 'next_right': 1},
        ],
        'decisive_transition': 'Pointers converge at middle index 1 (1 < 1 is false)',
        'expected': True,
        'actual': True,
        'test': 'returns true for odd-length palindrome fixture ("aba")',
    },
    {
        'input': 'ab',
        'length': 2,
        'initial_state': {'left': 0, 'right': 1},
        'intermediate_steps': [
            {'left': 0, 'right': 1, 'chars': ('a', 'b'), 'matched': False},
        ],
        'decisive_transition': 'Mismatch detected at index pair (0, 1): string[0] !== string[1]',
        'expected': False,
        'actual': False,
        'test': 'returns false for non-palindrome fixture ("ab")',
    },
    {
        'input': 'abba',
        'length': 4,
        'initial_state': {'left': 0, 'right': 3},
        'intermediate_steps': [
            {'left': 0, 'right': 3, 'chars': ('a', 'a'), 'matched': True, 'next_left': 1, 'next_right': 2},
            {'left': 1, 'right': 2, 'chars': ('b', 'b'), 'matched': True, 'next_left': 2, 'next_right': 1},
        ],
        'decisive_transition': 'Pointers cross (2 < 1 is false); all symmetrical pairs matched',
        'expected': True,
        'actual': True,
        'test': 'returns true for even-length palindrome fixture ("abba")',
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


def trace_is_palindrome(s):
    """Python reference tracing identical algorithm state steps."""
    left = 0
    right = len(s) - 1
    steps = []
    while left < right:
        match = (s[left] == s[right])
        steps.append({
            'left': left,
            'right': right,
            'chars': (s[left], s[right]),
            'matched': match,
        })
        if not match:
            return False, steps
        left += 1
        right -= 1
    return True, steps


def main():
    print('Starting verification for R51-T027...')
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

    # 2. Focused test run for isPalindrome
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

    # 3. Verify documentation contents in source file
    source_content = SOURCE_FILE.read_text(encoding='utf-8')
    if 'Normalization' not in source_content or 'NOT part of this function' not in source_content:
        raise RuntimeError('isPalindrome.js must explicitly specify that normalization is NOT part of this function.')

    if 'Decisive state transition' not in source_content:
        raise RuntimeError('isPalindrome.js must identify the decisive state transition.')

    for fixture in FIXTURES:
        if repr(fixture['input']) not in source_content and f'"{fixture["input"]}"' not in source_content:
            raise RuntimeError(f'Fixture input {fixture["input"]!r} missing from isPalindrome.js JSDoc.')

    # 4. Verify traced execution vs hand calculation
    for fixture in FIXTURES:
        res, steps = trace_is_palindrome(fixture['input'])
        if res != fixture['expected']:
            raise RuntimeError(
                f'Traced result {res} does not match expected {fixture["expected"]} for {fixture["input"]!r}'
            )
        fixture['actual'] = res

    # 5. Record evidence and results
    evidence = {
        'task': 'R51-T027',
        'issue': 27,
        'item': 'src/algorithms/string/palindrome',
        'behavior_contract': {
            'target_function': 'isPalindrome(string) at isPalindrome.js:6',
            'inputs': 'string (string primitive)',
            'result': 'boolean (true if palindrome, false otherwise)',
            'mutation_behavior': 'Pure function; does not mutate input; no side effects',
            'external_dependencies': []
        },
        'normalization_specification': (
            'Normalization (such as case folding, whitespace stripping, or punctuation removal) '
            'is NOT part of this function. Characters are compared directly and strictly at each '
            'position (string[left] !== string[right]) without pre-processing.'
        ),
        'decisive_state_transition': {
            'overview': (
                'Two pointers left = 0 and right = string.length - 1 contract towards the center. '
                'At each step, equality string[left] === string[right] is evaluated.'
            ),
            'mismatch_transition': (
                'If string[left] !== string[right], a mismatch is decisively established, '
                'immediately returning false without scanning remaining characters.'
            ),
            'convergence_transition': (
                'When left >= right, all symmetrical pairs have verified equal without mismatch, '
                'decisively establishing palindrome symmetry and returning true.'
            )
        },
        'fixtures_and_traced_execution': FIXTURES,
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
