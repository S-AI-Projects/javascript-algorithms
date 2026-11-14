import json
import re
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SOURCE = ROOT / 'src/algorithms/math/euclidean-algorithm/euclideanAlgorithm.js'
TEST = ROOT / 'src/algorithms/math/euclidean-algorithm/__test__/euclideanAlgorithm.test.js'
TEST_NAMES = [
    'returns zero for the smallest supported input pair',
    'calculates the GCD for ordinary non-divisible inputs',
]


def run(command):
    return subprocess.run(
        command,
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )


def output_of(result):
    return '{}{}'.format(result.stdout, result.stderr)


def require_success(result, command):
    if result.returncode != 0:
        raise RuntimeError(
            '{} failed with exit code {}\n{}'.format(
                shlex.join(command),
                result.returncode,
                output_of(result),
            )
        )


def run_tests(test_path):
    command = [
        'npm',
        'test',
        '--',
        '--runInBand',
        '--runTestsByPath',
        str(test_path.relative_to(ROOT)),
    ]
    return command, run(command)


def main():
    native_command = ['npm', 'test', '--', '--runInBand']
    native_result = run(native_command)
    require_success(native_result, native_command)
    native_output = output_of(native_result)
    native_summary = re.search(
        r'Tests:\s+(\d+) passed,\s+(\d+) total',
        native_output,
    )
    if native_summary is None:
        raise RuntimeError('Could not read the native Jest test count.\n{}'.format(native_output))

    passed_tests, total_tests = (int(value) for value in native_summary.groups())
    if total_tests == 0 or passed_tests != total_tests:
        raise RuntimeError('Native Jest run did not pass a nonzero test count.')

    source = SOURCE.read_text()
    original_guard = 'return (b === 0) ? a : euclideanAlgorithm(b, a % b);'
    mutant_guard = 'return (b >= 0) ? a : euclideanAlgorithm(b, a % b);'
    if source.count(original_guard) != 1:
        raise RuntimeError('Expected exactly one Euclidean algorithm base-case guard.')
    mutant_source = source.replace(original_guard, mutant_guard, 1)

    mutation_test = """import euclideanAlgorithm from './euclideanAlgorithm.mutant.js';

describe('euclideanAlgorithm', () => {
  it('returns zero for the smallest supported input pair', () => {
    expect(euclideanAlgorithm(0, 0)).toBe(0);
  });

  it('calculates the GCD for ordinary non-divisible inputs', () => {
    expect(euclideanAlgorithm(252, 105)).toBe(21);
  });
});
"""

    with tempfile.TemporaryDirectory(prefix='mutation-', dir=HERE) as temp_dir:
        temp_path = Path(temp_dir)
        mutant_path = temp_path / 'euclideanAlgorithm.mutant.js'
        mutant_test_path = temp_path / 'euclideanAlgorithm.mutation.test.js'
        mutant_path.write_text(mutant_source)
        mutant_test_path.write_text(mutation_test)
        mutant_command, mutant_result = run_tests(mutant_test_path)
        mutant_output = output_of(mutant_result)

    if mutant_result.returncode == 0:
        raise RuntimeError('The comparison mutant unexpectedly passed.\n{}'.format(mutant_output))
    if TEST_NAMES[1] not in mutant_output:
        raise RuntimeError(
            'The mutant run did not report assertion {!r}.\n{}'.format(
                TEST_NAMES[1],
                mutant_output,
            )
        )
    if 'Expected: 21' not in mutant_output or 'Received: 252' not in mutant_output:
        raise RuntimeError(
            'The ordinary-input assertion did not fail with the expected semantic mismatch.\n'
            '{}'.format(mutant_output)
        )
    mutation_summary = re.search(
        r'Tests:\s+(\d+) failed,\s+(\d+) passed,\s+(\d+) total',
        mutant_output,
    )
    if mutation_summary is None:
        raise RuntimeError('Could not read the mutation Jest test count.\n{}'.format(mutant_output))
    failed_mutant_tests, passed_mutant_tests, total_mutant_tests = (
        int(value) for value in mutation_summary.groups()
    )
    if (failed_mutant_tests, passed_mutant_tests, total_mutant_tests) != (1, 1, 2):
        raise RuntimeError(
            'The mutant must fail only the ordinary-input assertion.\n{}'.format(mutant_output)
        )

    versions = {}
    for name, command in (
        ('node', ['node', '--version']),
        ('npm', ['npm', '--version']),
    ):
        result = run(command)
        require_success(result, command)
        versions[name] = result.stdout.strip()
    versions['python'] = sys.version.split()[0]

    evidence = {
        'behavior_contract': {
            'result': 'A number, as documented at euclideanAlgorithm.js:5.',
            'inputs': 'Two numeric primitive arguments, documented at euclideanAlgorithm.js:3-4.',
            'mutation': 'Scalar arguments cannot be mutated; the function has no external state.',
        },
        'inputs_and_expected_outputs': [
            {
                'inputs': [0, 0],
                'expected': 0,
                'independent_calculation': 'By the supported gcd(0, 0) = 0 convention.',
                'test': TEST_NAMES[0],
            },
            {
                'inputs': [252, 105],
                'expected': 21,
                'independent_calculation': '252 = 2*105 + 42; 105 = 2*42 + 21; 42 = 2*21.',
                'test': TEST_NAMES[1],
            },
        ],
        'native_check': {
            'command': shlex.join(native_command),
            'passed': passed_tests,
            'total': total_tests,
            'failed': total_tests - passed_tests,
        },
        'mutation_check': {
            'command': shlex.join(mutant_command),
            'mutation': 'Changed the base-case comparison from b === 0 to b >= 0.',
            'exit_code': mutant_result.returncode,
            'failing_assertions': [TEST_NAMES[1]],
            'failed': failed_mutant_tests,
            'passed': passed_mutant_tests,
            'total': total_mutant_tests,
            'semantic_mismatch': 'Expected 21; received 252 for inputs [252, 105].',
        },
        'versions': versions,
    }
    evidence_path = HERE / 'evidence.json'
    evidence_path.write_text('{}\n'.format(json.dumps(evidence, indent=2)))
    print(
        'Native checks: {}/{} passed; mutation failed the ordinary-input assertion as expected.'
        .format(passed_tests, total_tests)
    )
    print('Evidence saved to {}.'.format(evidence_path.relative_to(ROOT)))


if __name__ == '__main__':
    main()
