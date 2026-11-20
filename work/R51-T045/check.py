import json, subprocess, sys, os

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return {
        "cmd": cmd,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }

def main():
    # Record tool versions
    versions = {}
    versions['node'] = run_cmd('node -v')
    versions['npm'] = run_cmd('npm -v')
    versions['python'] = run_cmd('python3 --version')

    # Run full test suite
    test_full = run_cmd('npm test -- --runInBand')
    # Run specific test
    test_specific = run_cmd('npm test -- src/algorithms/math/radian/__test__/degreeToRadian.test.js')
    # Lint
    lint = run_cmd('npm run lint')
    # Git diff check
    diff_check = run_cmd('git diff --check')

    evidence = {
        "versions": versions,
        "test_full": {"returncode": test_full['returncode'], "stdout": test_full['stdout'][:500]},
        "test_specific": {"returncode": test_specific['returncode'], "stdout": test_specific['stdout'][:500]},
        "lint": {"returncode": lint['returncode'], "stdout": lint['stdout'][:500]},
        "diff_check": {"returncode": diff_check['returncode'], "stdout": diff_check['stdout'][:500]},
    }
    # Write evidence.json
    os.makedirs('work/R51-T045', exist_ok=True)
    with open('work/R51-T045/evidence.json', 'w') as f:
        json.dump(evidence, f, indent=2)

    # Results placeholder (could include test pass/fail details)
    results = {
        "degreeToRadian_repeatability": "passed" if test_specific['returncode'] == 0 else "failed",
    }
    with open('work/R51-T045/results.json', 'w') as f:
        json.dump(results, f, indent=2)

    sys.exit(0)

if __name__ == '__main__':
    main()
