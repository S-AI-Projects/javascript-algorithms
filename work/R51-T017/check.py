#!/usr/bin/env python3
"""Run findAllPaths verification, domain fixtures, mutation check, and repository native test suite."""

import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile


WORK_DIR = Path(__file__).resolve().parent
ROOT = WORK_DIR.parents[1]
TEST_PATH = "src/algorithms/graph/travelling-salesman/__test__/bfTravellingSalesman.test.js"
SOURCE_PATH = "src/algorithms/graph/travelling-salesman/bfTravellingSalesman.js"

TOOL_VERSIONS_FILE = WORK_DIR / "tool-versions.json"
CASES_FILE = WORK_DIR / "cases.json"
FOCUSED_JEST_RESULTS_FILE = WORK_DIR / "focused-jest-results.json"
JEST_RESULTS_FILE = WORK_DIR / "jest-results.json"
NATIVE_TEST_SUMMARY_FILE = WORK_DIR / "native-test-summary.json"
RESULTS_FILE = WORK_DIR / "results.json"
TEST_RUN_LOG = WORK_DIR / "test-run.log"
MUTATION_LOG = WORK_DIR / "mutation-check.log"


def run(command, cwd=ROOT, env=None):
    return subprocess.run(
        command,
        cwd=cwd,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )


def get_tool_versions():
    node_version = subprocess.check_output(
        ["node", "--version"],
        cwd=ROOT,
        text=True,
    ).strip()
    npm_version = subprocess.check_output(
        ["npm", "--version"],
        cwd=ROOT,
        text=True,
    ).strip()
    return {
        "python": platform.python_version(),
        "node": node_version,
        "npm": npm_version,
    }


def read_jest_results(path):
    with path.open(encoding="utf-8") as file:
        results = json.load(file)
    return {
        "totalTests": results.get("numTotalTests", 0),
        "passedTests": results.get("numPassedTests", 0),
        "failedTests": results.get("numFailedTests", 0),
        "pendingTests": results.get("numPendingTests", 0),
        "testSuites": results.get("numTotalTestSuites", 0),
    }


def validate_cases(cases):
    required_fixtures = {
        "smallest valid input": False,
        "ordinary input": False,
        "documentation example": False,
        "immutability check": False,
    }

    for case in cases:
        fixture_name = case.get("fixture")
        if fixture_name in required_fixtures:
            required_fixtures[fixture_name] = True

        expected = case.get("expected")
        actual = case.get("actual")
        if actual != expected:
            raise ValueError(
                f"Assertion failed for case {case.get('name')}: expected {expected}, got {actual}"
            )

        if "preconditions" not in case or not case["preconditions"]:
            raise ValueError(
                f"Case {case.get('name')} missing source line preconditions"
            )

        if "decisive_state_transition" not in case:
            raise ValueError(
                f"Case {case.get('name')} missing decisive_state_transition"
            )

    missing = [name for name, found in required_fixtures.items() if not found]
    if missing:
        raise ValueError(f"Missing required fixture cases in evidence: {missing}")


def run_mutation_check():
    """Verify that tests catch a mutated findAllPaths (e.g. inverted base condition)."""
    with tempfile.TemporaryDirectory(prefix="findAllPaths-mutation-") as temp_dir:
        sandbox = Path(temp_dir)
        shutil.copytree(ROOT / "src", sandbox / "src")
        for filename in (".babelrc", "jest.config.js", "package.json"):
            shutil.copy2(ROOT / filename, sandbox / filename)
        (sandbox / "node_modules").symlink_to(
            ROOT / "node_modules",
            target_is_directory=True,
        )

        target_file = sandbox / SOURCE_PATH
        source = target_file.read_text(encoding="utf-8")

        # Mutate the decisive transition condition from `!unvisitedNeighbors.length` to `unvisitedNeighbors.length`
        original_impl = "if (!unvisitedNeighbors.length) {"
        mutated_impl = "if (unvisitedNeighbors.length) {"
        if original_impl not in source:
            raise RuntimeError("Could not find implementation segment to mutate in sandbox")

        target_file.write_text(
            source.replace(original_impl, mutated_impl),
            encoding="utf-8",
        )

        cmd = [
            "npm",
            "test",
            "--",
            "--runInBand",
            "--runTestsByPath",
            TEST_PATH,
            "--json",
            "--outputFile=jest-results.json",
        ]
        res = run(cmd, cwd=sandbox)
        failed_tests = 0
        mutation_results_file = sandbox / "jest-results.json"
        if mutation_results_file.exists():
            try:
                data = json.loads(mutation_results_file.read_text(encoding="utf-8"))
                failed_tests = data.get("numFailedTests", 0)
            except Exception:
                pass

        return {
            "command": " ".join(cmd),
            "exitCode": res.returncode,
            "failedTests": failed_tests,
            "output": res.stdout,
        }


def main():
    WORK_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Capture tool versions
    versions = get_tool_versions()
    TOOL_VERSIONS_FILE.write_text(
        json.dumps(versions, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Tool versions: {versions}")

    # 2. Install dependencies from lockfile
    print("\nRunning lockfile installation (npm ci)...")
    install_res = run(["npm", "ci"])
    if install_res.returncode != 0:
        print(f"npm ci failed with code {install_res.returncode}:\n{install_res.stdout}", file=sys.stderr)
        return install_res.returncode
    print("npm ci completed successfully.")

    # 3. Run focused Jest tests
    print("\nRunning focused findAllPaths tests...")
    env = os.environ.copy()
    env["FIND_ALL_PATHS_EVIDENCE_PATH"] = str(CASES_FILE)

    focused_cmd = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--watch=false",
        "--runTestsByPath",
        TEST_PATH,
        "--json",
        f"--outputFile={FOCUSED_JEST_RESULTS_FILE.relative_to(ROOT)}",
    ]
    focused_res = run(focused_cmd, env=env)
    print(focused_res.stdout)
    if focused_res.returncode != 0:
        print("Focused checks failed!", file=sys.stderr)
        return focused_res.returncode

    if not CASES_FILE.exists():
        print(f"Error: {CASES_FILE} was not generated", file=sys.stderr)
        return 1

    cases = json.loads(CASES_FILE.read_text(encoding="utf-8"))
    validate_cases(cases)
    print(f"Validated {len(cases)} findAllPaths execution evidence cases successfully.")

    focused_summary = read_jest_results(FOCUSED_JEST_RESULTS_FILE)
    print(f"Focused Jest results: {focused_summary}")

    # 4. Run mutation check
    print("\nRunning mutation verification to ensure test sensitivity...")
    mutation = run_mutation_check()
    MUTATION_LOG.write_text(mutation["output"], encoding="utf-8")
    mutation_detected = (
        mutation["exitCode"] != 0 or mutation.get("failedTests", 0) > 0
    )
    print(
        f"Mutation detected: {mutation_detected} "
        f"(exit code: {mutation['exitCode']}, failed tests: {mutation.get('failedTests', 0)})"
    )
    if not mutation_detected:
        print("Error: Deliberate mutation was not detected by the test suite!", file=sys.stderr)
        return 1

    # 5. Run full native test suite in non-watch mode
    print("\nRunning repository native test suite...")
    native_cmd = [
        "npm",
        "test",
        "--",
        "--runInBand",
        "--watch=false",
        "--json",
        f"--outputFile={JEST_RESULTS_FILE.relative_to(ROOT)}",
    ]
    native_res = run(native_cmd)
    TEST_RUN_LOG.write_text(native_res.stdout, encoding="utf-8")
    print(f"Native test run exited with code {native_res.returncode}")

    if not JEST_RESULTS_FILE.exists():
        print("Error: native test output jest-results.json not found", file=sys.stderr)
        return 1

    native_summary = read_jest_results(JEST_RESULTS_FILE)
    print(f"Native Jest summary: {native_summary}")

    native_summary_data = {
        "command": " ".join(native_cmd),
        "exit_code": native_res.returncode,
        "total_tests": native_summary["totalTests"],
        "passed_tests": native_summary["passedTests"],
        "failed_tests": native_summary["failedTests"],
        "pending_tests": native_summary["pendingTests"],
        "test_suites": native_summary["testSuites"],
    }
    NATIVE_TEST_SUMMARY_FILE.write_text(
        json.dumps(native_summary_data, indent=2) + "\n",
        encoding="utf-8",
    )

    if native_res.returncode != 0 or native_summary["failedTests"] > 0:
        print("Error: Native test suite has failures!", file=sys.stderr)
        return 1

    # 6. Save comprehensive results.json
    results = {
        "versions": versions,
        "code_inspection": {
            "target": "findAllPaths (line 40)",
            "pinned_source": "src/algorithms/graph/travelling-salesman/bfTravellingSalesman.js:7",
            "file": SOURCE_PATH,
            "public_inputs": [
                {
                    "name": "startVertex",
                    "type": "GraphVertex",
                    "description": "Starting vertex for generating all maximal simple paths",
                },
                {
                    "name": "paths",
                    "type": "GraphVertex[][]",
                    "description": "Accumulator array for complete paths (defaults to [])",
                },
                {
                    "name": "path",
                    "type": "GraphVertex[]",
                    "description": "Current path prefix leading up to startVertex (defaults to [])",
                },
            ],
            "return_value": "GraphVertex[][] - Array of all maximal simple paths from startVertex",
            "mutation_behavior": (
                "Mutates the paths accumulator by appending completed paths. "
                "Preserves input non-mutation for path prefix via [...path] clone. "
                "Does not mutate startVertex, its neighbors, or the graph."
            ),
            "external_dependencies": (
                "GraphVertex.prototype.getKey and GraphVertex.prototype.getNeighbors. "
                "Deterministic, synchronous in-memory traversal without global state or I/O."
            ),
            "source_preconditions": {
                "line_7": "Default parameters paths = [] and path = []",
                "line_17": "updatedAccumulator[vertex.getKey()] requires getKey() method on vertices",
                "line_23": "startVertex.getNeighbors() requires getNeighbors() method returning array",
                "line_24": "!visitedSet[neighbor.getKey()] requires getKey() on neighbor vertices",
                "line_28": "!unvisitedNeighbors.length establishes decisive transition condition for base-case path completion",
                "line_35_38": "for loop over unvisitedNeighbors establishes recursive branching exploration",
            },
            "decisive_state_transition": (
                "When unvisitedNeighbors.length === 0 (line 28), all reachable neighbors "
                "from this branch are already in visitedSet. This triggers the decisive base-case "
                "transition: the current path is pushed to paths and the branch terminates."
            ),
        },
        "documentation_example": {
            "description": "Concrete worked example of findAllPaths starting at vertex A on triangle graph A-B, B-C, A-C",
            "literal_input": {
                "startVertex": "A",
                "graphEdges": ["A-B", "B-C", "A-C"],
            },
            "expected_output": [["A", "B", "C"], ["A", "C", "B"]],
        },
        "install_command": "npm ci",
        "install_exit_code": install_res.returncode,
        "focused_check": {
            "command": " ".join(focused_cmd),
            "exit_code": focused_res.returncode,
            "test_count": focused_summary,
        },
        "mutation_check": {
            "command": mutation["command"],
            "detected": mutation_detected,
            "exit_code": mutation["exitCode"],
            "failed_tests": mutation.get("failedTests", 0),
        },
        "native_check": native_summary_data,
        "cases": cases,
    }

    RESULTS_FILE.write_text(
        json.dumps(results, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"\nAll checks passed. Evidence saved in {WORK_DIR.relative_to(ROOT)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

