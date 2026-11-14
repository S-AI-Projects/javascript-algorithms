import json
import shlex
import subprocess
from pathlib import Path


EVIDENCE_DIRECTORY = Path(__file__).resolve().parent
REPOSITORY_ROOT = EVIDENCE_DIRECTORY.parents[1]
JEST_RESULTS = EVIDENCE_DIRECTORY / 'jest-results.json'
RUN_METADATA = EVIDENCE_DIRECTORY / 'run-metadata.json'


def command_output(command):
    return subprocess.run(
        command,
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def main():
    command = [
        'npm',
        'test',
        '--',
        '--runInBand',
        '--json',
        f'--outputFile={JEST_RESULTS}',
    ]
    inputs = json.loads((EVIDENCE_DIRECTORY / 'inputs.json').read_text())

    process = subprocess.run(
        command,
        cwd=REPOSITORY_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )

    jest_results = json.loads(JEST_RESULTS.read_text()) if JEST_RESULTS.exists() else {}
    metadata = {
        'command': shlex.join(command),
        'returnCode': process.returncode,
        'passedTests': jest_results.get('numPassedTests'),
        'failedTests': jest_results.get('numFailedTests'),
        'totalTests': jest_results.get('numTotalTests'),
        'inputs': inputs,
        'toolVersions': {
            'node': command_output(['node', '--version']),
            'npm': command_output(['npm', '--version']),
            'python': command_output(['python3', '--version']),
        },
    }
    RUN_METADATA.write_text(f'{json.dumps(metadata, indent=2)}\n')
    JEST_RESULTS.unlink(missing_ok=True)

    if process.returncode:
        print(process.stdout, end='')
        print(process.stderr, end='')
        raise SystemExit(process.returncode)

    print(
        f"Passed {metadata['passedTests']} tests "
        f"({metadata['failedTests']} failed); command: {metadata['command']}"
    )
    print(f'Run metadata: {RUN_METADATA}')
    print(f'Experiment results: {EVIDENCE_DIRECTORY / "experiment-results.json"}')


if __name__ == '__main__':
    main()
