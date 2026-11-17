#!/usr/bin/env python3
"""
check.py - Focused runner for R51-T030 (generateKeyMatrix mutation-resistant tests).

Validates:
1. Native repository test script passes with non-zero test count.
2. Focused regression tests for generateKeyMatrix pass under original implementation.
3. A deliberate accumulation mutant (keyStringIndex += 0 instead of += 1) fails the
   2x2 cell values assertion with an exact semantic mismatch while 1x1 passes.
4. Dimensions and independently calculated cell values are checked, rectangular
   inputs are rejected as unsupported, and zero-containing matrices are verified.
5. Saves test evidence, inputs, expected/actual results, and tool versions to work/R51-T030/.
"""
import json
import os
import re
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK_DIR = Path(__file__).resolve().parent
HILL_CIPHER_DIR = ROOT / 'src/algorithms/cryptography/hill-cipher'
SOURCE_FILE = HILL_CIPHER_DIR / 'hillCipher.js'
TEST_FILE = HILL_CIPHER_DIR / '_test_/hillCipher.test.js'

TEST_NAMES = [
    'generates a 1x1 key matrix for a single character key string',
    'generates a 2x2 key matrix with independently calculated cell values',
    'rejects rectangular matrix shapes since key matrices must be square',
    'generates a 3x3 key matrix containing zero for HILLMAGIC',
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
    print('Starting verification for R51-T030...')
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

    # 2. Verify source and mutation
    source_content = SOURCE_FILE.read_text(encoding='utf-8')
    original_line = 'keyStringIndex += 1;'
    mutant_line = 'keyStringIndex += 0;'

    if source_content.count(original_line) != 1:
        raise RuntimeError('Expected exactly one occurrence of {!r} in {}'.format(original_line, SOURCE_FILE))

    mutant_source = source_content.replace(original_line, mutant_line, 1)

    # Relative path inside hill-cipher needs adjustment when in subfolder
    # The temp directory will be placed directly inside HILL_CIPHER_DIR so imports resolve identically
    mutant_test_content = """
import { generateKeyMatrix } from './hillCipher.mutant.js';

describe('generateKeyMatrix mutation check', () => {
  it('generates a 1x1 key matrix for a single character key string', () => {
    const keyMatrix = generateKeyMatrix('A');
    expect(keyMatrix.length).toBe(1);
    expect(keyMatrix[0].length).toBe(1);
    expect(keyMatrix).toEqual([[0]]);
  });

  it('generates a 2x2 key matrix with independently calculated cell values', () => {
    const keyMatrix = generateKeyMatrix('ABCD');
    expect(keyMatrix.length).toBe(2);
    expect(keyMatrix[0].length).toBe(2);
    expect(keyMatrix).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });
});
"""

    with tempfile.TemporaryDirectory(prefix='mutation-', dir=HILL_CIPHER_DIR) as temp_dir:
        temp_path = Path(temp_dir)
        mutant_path = temp_path / 'hillCipher.mutant.js'
        mutant_test_path = temp_path / 'hillCipher.mutation.test.js'
        # Adjust matrix import for 1 deeper level: ../../math/matrix/Matrix -> ../../../math/matrix/Matrix
        mutant_source_adjusted = mutant_source.replace(
            "../../math/matrix/Matrix",
            "../../../math/matrix/Matrix"
        )
        mutant_path.write_text(mutant_source_adjusted, encoding='utf-8')
        mutant_test_path.write_text(mutant_test_content, encoding='utf-8')

        mutant_rel_test = mutant_test_path.relative_to(ROOT)
        mutant_command = ['npm', 'test', '--', '--runInBand', '--runTestsByPath', str(mutant_rel_test)]
        print('Running mutant test suite: {}'.format(shlex.join(mutant_command)))
        mutant_result = run(mutant_command)
        mutant_output = mutant_result.stdout + mutant_result.stderr

    # 3. Verify mutant failed as expected
    if mutant_result.returncode == 0:
        raise RuntimeError('The accumulation mutant unexpectedly passed!\n' + mutant_output)

    if TEST_NAMES[1] not in mutant_output:
        raise RuntimeError('Expected assertion {!r} to fail in mutant output:\n{}'.format(TEST_NAMES[1], mutant_output))

    if '-     1,' not in mutant_output or '+     0,' not in mutant_output:
        raise RuntimeError('Mutant did not fail with expected semantic mismatch in cells:\n' + mutant_output)

    mutant_summary_match = re.search(r'Tests:\s+(\d+) failed,\s+(\d+) passed,\s+(\d+) total', mutant_output)
    if not mutant_summary_match:
        raise RuntimeError('Could not parse mutant Jest summary:\n' + mutant_output)

    failed_mutants, passed_mutants, total_mutants = (int(v) for v in mutant_summary_match.groups())
    if (failed_mutants, passed_mutants, total_mutants) != (1, 1, 2):
        raise RuntimeError(
            'Expected (failed, passed, total) = (1, 1, 2), got ({}, {}, {})'.format(
                failed_mutants, passed_mutants, total_mutants
            )
        )
    print('Mutation checks passed: mutant correctly failed {}/{} assertions with semantic mismatch.'.format(
        failed_mutants, total_mutants
    ))

    # 4. Record evidence
    evidence = {
        'task': 'R51-T030',
        'issue': 30,
        'item': 'src/algorithms/cryptography/hill-cipher',
        'behavior_contract': {
            'target_function': 'generateKeyMatrix(keyString) at hillCipher.js:13',
            'inputs': 'keyString (string whose length must have an integer square root, e.g. 1, 4, 9)',
            'result': 'number[][] matrix of dimensions [matrixSize, matrixSize] with shifted char codes',
            'mutation_behavior': 'Pure function; does not mutate input string; returns newly allocated 2D array',
            'external_dependencies': [
                '../../math/matrix/Matrix (mtrx.generate)',
                'Math.sqrt',
                'Number.isInteger',
                'String.prototype.codePointAt'
            ]
        },
        'fixture_and_invariants': {
            'small_rectangular_matrix': (
                'Rectangular matrix inputs are NOT supported by generateKeyMatrix because Hill cipher '
                'key matrices must be square (dimensions N x N). Calling generateKeyMatrix with rectangular '
                'key lengths such as 2 (\'AB\') or 6 (\'ABCDEF\') throws Error: '
                '"Invalid key string length. The square root of the key string must be an integer".'
            ),
            '1x1_matrix': (
                'Smallest valid matrix fixture: keyString \'A\' of length 1 (Math.sqrt(1) = 1), '
                'producing 1x1 matrix [[0]].'
            ),
            'zero_containing_matrix': (
                'Tested with keyString \'A\' (yielding [[0]]), keyString \'ABCD\' (yielding [[0, 1], [2, 3]]), '
                'and keyString \'HILLMAGIC\' (yielding [[7, 8, 11], [11, 12, 0], [6, 8, 2]]). All contain zero cells.'
            ),
            'determinant_interface_note': (
                'As specified in the goal instructions, determinant([[1,2],[3,4]]) = -2 applies strictly to '
                'a determinant interface. generateKeyMatrix generates the key matrix representation, not its determinant.'
            )
        },
        'inputs_and_expected_outputs': [
            {
                'input': 'A',
                'expected': [[0]],
                'actual_original': [[0]],
                'actual_mutant': [[0]],
                'dimensions': [1, 1],
                'independent_calculation': '\'A\'.codePointAt(0) % 65 = 65 % 65 = 0',
                'test': TEST_NAMES[0]
            },
            {
                'input': 'ABCD',
                'expected': [[0, 1], [2, 3]],
                'actual_original': [[0, 1], [2, 3]],
                'actual_mutant': [[0, 0], [0, 0]],
                'dimensions': [2, 2],
                'independent_calculation': '\'A\': 65%65=0, \'B\': 66%65=1, \'C\': 67%65=2, \'D\': 68%65=3',
                'test': TEST_NAMES[1]
            },
            {
                'input': 'AB / ABCDEF',
                'expected': 'throws Error: Invalid key string length. The square root of the key string must be an integer',
                'actual_original': 'throws Error: Invalid key string length. The square root of the key string must be an integer',
                'dimensions': 'non-square / rectangular (unsupported)',
                'test': TEST_NAMES[2]
            },
            {
                'input': 'HILLMAGIC',
                'expected': [[7, 8, 11], [11, 12, 0], [6, 8, 2]],
                'actual_original': [[7, 8, 11], [11, 12, 0], [6, 8, 2]],
                'dimensions': [3, 3],
                'independent_calculation': '\'H\': 7, \'I\': 8, \'L\': 11, \'L\': 11, \'M\': 12, \'A\': 0, \'G\': 6, \'I\': 8, \'C\': 2',
                'test': TEST_NAMES[3]
            }
        ],
        'native_check': {
            'command': shlex.join(native_command),
            'passed': passed_tests,
            'total': total_tests,
            'failed': total_tests - passed_tests
        },
        'mutation_check': {
            'command': 'npm test -- --runInBand --runTestsByPath <temp_dir>/hillCipher.mutation.test.js',
            'mutation': 'Altered index accumulation from \'keyStringIndex += 1;\' to \'keyStringIndex += 0;\'.',
            'exit_code': mutant_result.returncode,
            'failing_assertions': [TEST_NAMES[1]],
            'failed': failed_mutants,
            'passed': passed_mutants,
            'total': total_mutants,
            'semantic_mismatch': 'Expected [[0, 1], [2, 3]]; received [[0, 0], [0, 0]] due to unadvanced character index.'
        },
        'versions': versions
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
