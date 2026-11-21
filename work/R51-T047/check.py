import json
import os
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = Path(__file__).resolve().parent
TEST_FILE = "src/data-structures/bloom-filter/__test__/BloomFilter.test.js"
EXPECTED_OUTPUT = [
    "[0,0,0]",
    "true",
    "true",
    "[14,43,10]",
    "[true,true,true]",
    "[0,61,10]",
    "[false,false,true]",
    "true",
    "false",
]
EXAMPLE_RUNNER = r"""
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
const source = fs.readFileSync('src/data-structures/bloom-filter/BloomFilter.js', 'utf8');
const doc = source.match(/\/\*\*([\s\S]*?@example[\s\S]*?)\*\//)[1];
const start = doc.indexOf('@example') + '@example'.length;
const end = doc.indexOf('@example-output');
const code = doc.slice(start, end)
  .split('\n')
  .map(line => line.replace(/^\s*\*\s?/, '').trimEnd())
  .join('\n')
  .trim();
const compiled = babel.transformSync(source, {
  filename: 'src/data-structures/bloom-filter/BloomFilter.js',
}).code;
const module = { exports: {} };
vm.runInNewContext(compiled, { exports: module.exports, module, require });
const actual = [];
vm.runInNewContext(code, {
  BloomFilter: module.exports.default,
  console: { log: (...values) => actual.push(values.join(' ')) },
});
process.stdout.write(JSON.stringify(actual));
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
    example_run = run_command(["node", "-e", EXAMPLE_RUNNER])
    actual_output = (
        json.loads(example_run["stdout"]) if example_run["returncode"] == 0 else None
    )
    focused_tests = run_command(
        ["npm", "test", "--", "--runInBand", TEST_FILE]
    )
    full_tests = run_command(["npm", "test", "--", "--runInBand"])
    lint = run_command(["npm", "run", "lint"])
    diff_check = run_command(["git", "diff", "--check"])

    evidence = {
        "versions": versions,
        "install": install,
        "example_execution": example_run,
        "focused_tests": {
            **focused_tests,
            "counts": test_counts(focused_tests),
        },
        "full_tests": {
            **full_tests,
            "counts": test_counts(full_tests),
        },
        "lint": lint,
        "diff_check": diff_check,
    }
    results = {
        "inputs": {
            "smallest_positive_size": {
                "size": 1,
                "inserted": "a",
                "queries": ["a", "b"],
            },
            "ordinary_default_size": {
                "size": 100,
                "inserted": "apple",
                "queries": ["apple", "orange"],
            },
        },
        "preconditions": {
            "size_and_store": "BloomFilter.js:41-45",
            "initial_false_bits": "BloomFilter.js:89-91",
            "insertion_sets_bits": "BloomFilter.js:51-56",
            "query_rejects_a_false_bit": "BloomFilter.js:62-73",
            "three_hash_indexes": "BloomFilter.js:160-165",
        },
        "expected_example_output": EXPECTED_OUTPUT,
        "actual_example_output": actual_output,
        "example_output_matches": actual_output == EXPECTED_OUTPUT,
        "focused_test_counts": test_counts(focused_tests),
        "full_test_counts": test_counts(full_tests),
    }

    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    (EVIDENCE_DIR / "evidence.json").write_text(
        json.dumps(evidence, indent=2) + os.linesep,
        encoding="utf-8",
    )
    (EVIDENCE_DIR / "results.json").write_text(
        json.dumps(results, indent=2) + os.linesep,
        encoding="utf-8",
    )

    checks = [
        *versions.values(),
        install,
        example_run,
        focused_tests,
        full_tests,
        lint,
        diff_check,
    ]
    if any(check["returncode"] != 0 for check in checks):
        sys.exit(1)
    if actual_output != EXPECTED_OUTPUT:
        sys.exit(1)


if __name__ == "__main__":
    main()
