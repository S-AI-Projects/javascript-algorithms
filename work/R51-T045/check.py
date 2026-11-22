import json
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = Path(__file__).resolve().parent
TEST_FILE = "src/algorithms/math/radian/__test__/degreeToRadian.test.js"

FIXTURE_INPUTS = [0, 180]
EXPECTED_OUTPUTS = {
    "0": 0.0,
    "180": 3.141592653589793,
}

ACTUAL_RESULTS_RUNNER = """
import degreeToRadian from './src/algorithms/math/radian/degreeToRadian.js';

const fixtureInputs = [0, 180];
const actualOutputs = {};
for (const d of fixtureInputs) {
  actualOutputs[String(d)] = degreeToRadian(d);
}

// Isolated repeatability test
const run1_0 = degreeToRadian(0);
const run2_0 = degreeToRadian(0);
const intermediate = degreeToRadian(90);
const run3_0 = degreeToRadian(0);
const repeatableZero = (run1_0 === 0 && run2_0 === 0 && run3_0 === 0 && intermediate === Math.PI / 2);

const run1_180 = degreeToRadian(180);
const run2_180 = degreeToRadian(180);
const intermediate45 = degreeToRadian(45);
const run3_180 = degreeToRadian(180);
const repeatable180 = (run1_180 === Math.PI && run2_180 === Math.PI && run3_180 === Math.PI && intermediate45 === Math.PI / 4);

// Caller-owned state immutability
const callerState = { angle: 180, tag: 'caller-owned', nested: { val: 42 } };
const before = JSON.stringify(callerState);
degreeToRadian(callerState.angle);
const after = JSON.stringify(callerState);

process.stdout.write(JSON.stringify({
  actual_outputs: actualOutputs,
  repeatable_zero: repeatableZero,
  repeatable_180: repeatable180,
  caller_state_preserved: before === after,
}));
"""


def run_command(command):
    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return {
        "command": command,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def test_counts(result):
    combined_output = result["stdout"] + result["stderr"]
    summary = re.search(r"Tests:\s+(.+)", combined_output)
    if not summary:
        return {"passed": None, "failed": None, "summary": None}

    text = summary.group(1)
    passed = re.search(r"(\d+) passed", text)
    failed = re.search(r"(\d+) failed", text)
    return {
        "passed": int(passed.group(1)) if passed else 0,
        "failed": int(failed.group(1)) if failed else 0,
        "summary": text,
    }


def main():
    versions = {
        "node": run_command(["node", "--version"]),
        "npm": run_command(["npm", "--version"]),
        "python": run_command(["python3", "--version"]),
    }

    install = run_command(["npm", "ci", "--no-audit", "--no-fund"])

    actual_run = run_command(
        ["node", "--input-type=module", "-e", ACTUAL_RESULTS_RUNNER]
    )
    try:
        actual_data = (
            json.loads(actual_run["stdout"])
            if actual_run["returncode"] == 0
            else {}
        )
    except Exception:
        actual_data = {}

    focused_tests = run_command(
        ["npm", "test", "--", "--runInBand", TEST_FILE]
    )
    full_tests = run_command(["npm", "test", "--", "--runInBand"])
    lint = run_command(["npm", "run", "lint"])
    diff_check = run_command(["git", "diff", "--check"])

    focused_counts = test_counts(focused_tests)
    full_counts = test_counts(full_tests)

    evidence = {
        "versions": versions,
        "install": install,
        "actual_execution": actual_run,
        "focused_tests": {
            **focused_tests,
            "counts": focused_counts,
        },
        "full_tests": {
            **full_tests,
            "counts": full_counts,
        },
        "lint": lint,
        "diff_check": diff_check,
    }

    results = {
        "item": "src/algorithms/math/radian",
        "task_type": "Deterministic execution",
        "inputs": {
            "smallest_valid_input": 0,
            "ordinary_input": 180,
            "fixture_inputs": FIXTURE_INPUTS,
        },
        "preconditions": {
            "function_signature": "degreeToRadian.js:14",
            "pure_return_conversion": "degreeToRadian.js:15",
            "observable_dependencies": "none",
        },
        "expected_outputs": EXPECTED_OUTPUTS,
        "actual_outputs": actual_data.get("actual_outputs", {}),
        "repeatable_execution": (
            actual_data.get("repeatable_zero", False)
            and actual_data.get("repeatable_180", False)
        ),
        "caller_state_preserved": actual_data.get("caller_state_preserved", False),
        "focused_test_counts": focused_counts,
        "full_test_counts": full_counts,
    }

    target_dir = ROOT / "work" / "R51-T045"
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "evidence.json").write_text(
        json.dumps(evidence, indent=2) + os.linesep,
        encoding="utf-8",
    )
    (target_dir / "results.json").write_text(
        json.dumps(results, indent=2) + os.linesep,
        encoding="utf-8",
    )

    checks = [
        *versions.values(),
        install,
        actual_run,
        focused_tests,
        full_tests,
        lint,
        diff_check,
    ]
    if any(check["returncode"] != 0 for check in checks):
        sys.exit(1)

    if not actual_data.get("repeatable_zero") or not actual_data.get("repeatable_180"):
        sys.exit(1)
    if not actual_data.get("caller_state_preserved"):
        sys.exit(1)
    if (focused_counts["failed"] or 0) > 0 or (focused_counts["passed"] or 0) < 1:
        sys.exit(1)
    if (full_counts["failed"] or 0) > 0 or (full_counts["passed"] or 0) < 1:
        sys.exit(1)


if __name__ == "__main__":
    main()
