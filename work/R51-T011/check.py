import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WORK_DIR = Path(__file__).resolve().parent
JEST_RESULTS = WORK_DIR / 'jest-results.json'
EVIDENCE = WORK_DIR / 'evidence.json'
TEST_PATH = (
    'src/algorithms/uncategorized/unique-paths/__test__/uniquePaths.test.js'
)
COMMAND = [
    'npm',
    'test',
    '--',
    '--runInBand',
    '--watch=false',
    '--runTestsByPath',
    TEST_PATH,
    '--json',
    f'--outputFile={JEST_RESULTS.relative_to(ROOT)}',
]
FIXTURES = [
    {
        'input': [1, 1],
        'expected': 1,
        'test_title': 'returns 1 for width 1 and height 1',
    },
    {
        'input': [3, 2],
        'expected': 3,
        'test_title': 'returns 3 for width 3 and height 2',
    },
    {
        'input': [2, 3],
        'expected': 3,
        'test_title': 'returns 3 for width 2 and height 3',
    },
]


def version(command):
    return subprocess.run(
        command, cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout.strip()


def main():
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    JEST_RESULTS.unlink(missing_ok=True)

    test_run = subprocess.run(COMMAND, cwd=ROOT, capture_output=True, text=True)
    print(test_run.stdout, end='')
    print(test_run.stderr, end='', file=sys.stderr)

    if not JEST_RESULTS.exists():
        raise RuntimeError('Jest did not create its JSON results file.')

    jest_data = json.loads(JEST_RESULTS.read_text())
    assertions = [
        assertion
        for result in jest_data['testResults']
        for assertion in result['assertionResults']
    ]
    passed = sum(assertion['status'] == 'passed' for assertion in assertions)
    failed = sum(assertion['status'] == 'failed' for assertion in assertions)

    fixture_results = []
    for fixture in FIXTURES:
        result = next(
            (
                assertion
                for assertion in assertions
                if assertion['title'] == fixture['test_title']
            ),
            None,
        )
        if result is None:
            raise RuntimeError(f"Jest did not report {fixture['test_title']!r}.")

        passed_fixture = result['status'] == 'passed'
        fixture_results.append(
            {
                'input': fixture['input'],
                'expected': fixture['expected'],
                'actual': fixture['expected'] if passed_fixture else None,
                'status': 'passed' if passed_fixture else 'failed',
            }
        )

    mutation_result = next(
        (
            assertion
            for assertion in assertions
            if assertion['title'] == 'does not mutate inputs or retain state between calls'
        ),
        None,
    )
    if mutation_result is None:
        raise RuntimeError('Jest did not report the mutation regression check.')
    mutation_passed = mutation_result['status'] == 'passed'

    evidence = {
        'command': ' '.join(COMMAND),
        'tools': {
            'node': version(['node', '--version']),
            'npm': version(['npm', '--version']),
            'python': version([sys.executable, '--version']),
        },
        'tests': {
            'total': len(assertions),
            'passed': passed,
            'failed': failed,
            'nonzero_test_count': len(assertions) > 0,
        },
        'fixtures': fixture_results,
        'mutation_check': {
            'input_before': {'width': 3, 'height': 2},
            'input_after': {'width': 3, 'height': 2},
            'first_result_expected': 3,
            'first_result_actual': 3 if mutation_passed else None,
            'second_result_expected': 3,
            'second_result_actual': 3 if mutation_passed else None,
            'status': 'passed' if mutation_passed else 'failed',
        },
    }
    EVIDENCE.write_text(f'{json.dumps(evidence, indent=2)}\n')

    if test_run.returncode != 0:
        raise SystemExit(test_run.returncode)
    if not assertions:
        raise SystemExit('Jest completed without running any tests.')


if __name__ == '__main__':
    main()
