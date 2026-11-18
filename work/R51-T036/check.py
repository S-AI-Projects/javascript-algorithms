#!/usr/bin/env python3
"""Install locked dependencies and verify the focused linearSearch contract."""

import json
import os
from pathlib import Path
import re
import subprocess
import sys


TASK_DIR = Path(__file__).resolve().parent
ROOT = TASK_DIR.parents[1]
LOG_PATH = TASK_DIR / 'check.log'
SUMMARY_PATH = TASK_DIR / 'check-summary.json'
BEFORE_EVIDENCE_PATH = TASK_DIR / 'before-evidence.json'
AFTER_EVIDENCE_PATH = TASK_DIR / 'after-evidence.json'

records = []
log_entries = []


def write_log():
    LOG_PATH.write_text('\n\n'.join(log_entries) + '\n', encoding='utf-8')


def write_summary(status, extra=None):
    summary = {
        'status': status,
        'commands': records,
    }
    if extra:
        summary.update(extra)
    SUMMARY_PATH.write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')


def run(command, description, env=None):
    printable = f'{description} {" ".join(command)}'.strip()
    print(f'$ {printable}', flush=True)
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    output = result.stdout
    print(output, end='', flush=True)
    records.append({
        'command': printable,
        'exit_code': result.returncode,
    })
    log_entries.append(f'$ {printable}\n{output}')
    write_log()
    if result.returncode != 0:
        raise subprocess.CalledProcessError(result.returncode, command, output=output)
    return output


def tool_version(command):
    result = subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
    )
    return result.stdout.strip()


def main():
    environment = {
        'node': tool_version(['node', '--version']),
        'npm': tool_version(['npm', '--version']),
        'python': sys.version.split()[0],
    }
    (TASK_DIR / 'environment.json').write_text(
        json.dumps(environment, indent=2) + '\n',
        encoding='utf-8',
    )

    if not BEFORE_EVIDENCE_PATH.exists():
        raise FileNotFoundError(f'Missing before-state evidence: {BEFORE_EVIDENCE_PATH}')

    install_environment = os.environ.copy()
    install_environment['HUSKY'] = '0'
    run(['npm', 'ci'], 'HUSKY=0', install_environment)

    focused_environment = os.environ.copy()
    focused_environment['LINEAR_SEARCH_EVIDENCE_PATH'] = str(AFTER_EVIDENCE_PATH)
    focused_test = 'src/algorithms/search/linear-search/__test__/linearSearch.test.js'
    run(
        ['npm', 'test', '--', '--runInBand', '--watchAll=false', '--runTestsByPath', focused_test],
        '',
        focused_environment,
    )

    before_evidence = json.loads(BEFORE_EVIDENCE_PATH.read_text(encoding='utf-8'))
    after_evidence = json.loads(AFTER_EVIDENCE_PATH.read_text(encoding='utf-8'))
    if before_evidence != after_evidence:
        raise AssertionError('Focused before/after expected and actual results do not agree')

    full_test_output = run(
        ['npm', 'test', '--', '--runInBand', '--watchAll=false'],
        '',
    )
    test_summary = next(
        (line.strip() for line in full_test_output.splitlines() if line.strip().startswith('Tests:')),
        '',
    )
    passed_match = re.search(r'(\d+) passed', test_summary)
    if not passed_match or int(passed_match.group(1)) == 0:
        raise AssertionError(f'Could not confirm a non-zero passing test count: {test_summary}')

    run(['npm', 'run', 'lint'], '')
    write_summary('passed', {
        'environment': environment,
        'full_test_summary': test_summary,
        'nonzero_test_count': int(passed_match.group(1)),
        'before_after_evidence_agrees': True,
    })
    print(f'All checks passed; {passed_match.group(1)} tests passed in the repository suite.')
    return 0


if __name__ == '__main__':
    try:
        exit_code = main()
    except Exception as error:  # Keep a machine-readable failure record for reviewers.
        write_summary('failed', {'error': str(error)})
        print(f'check.py failed: {error}', file=sys.stderr)
        exit_code = 1
    sys.exit(exit_code)
