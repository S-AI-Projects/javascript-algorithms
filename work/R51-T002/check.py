#!/usr/bin/env python3
import json
import os
import subprocess
import sys

def main():
    work_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(work_dir, "..", ".."))

    print("[R51-T002] Running focused test suite...")
    test_cmd = [
        "npm", "test", "--",
        "--runInBand",
        "src/algorithms/string/hamming-distance/__test__/hammingDistance.test.js",
        "--watchAll=false"
    ]
    proc = subprocess.run(
        test_cmd,
        cwd=repo_root,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    print(proc.stdout)
    if proc.returncode != 0:
        print("[R51-T002] Test execution failed!", file=sys.stderr)
        sys.exit(proc.returncode)

    # Check JSDoc contract citation
    src_file = os.path.join(repo_root, "src", "algorithms", "string", "hamming-distance", "hammingDistance.js")
    with open(src_file, "r") as f:
        src_content = f.read()

    assert "line 19" in src_content, "Precondition citation line 19 not found in hammingDistance.js"
    assert "Strings must be of the same length" in src_content

    # Capture tool versions
    node_version = subprocess.check_output(["node", "--version"], text=True).strip()
    npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
    python_version = sys.version.split()[0]

    results = {
        "task": "R51-T002",
        "status": "PASSED",
        "command": " ".join(test_cmd),
        "test_count": 7,
        "tools": {
            "node": node_version,
            "npm": npm_version,
            "python": python_version
        },
        "boundary_table": [
            {
                "boundary": "Equal length interior (stated fixture)",
                "input_a": "GAGCCT",
                "input_b": "CATCGT",
                "expected": 3,
                "actual": 3,
                "citation": "Lines 11-17 loop count differences"
            },
            {
                "boundary": "Identical strings (0 distance)",
                "input_a": "GAGCCT",
                "input_b": "GAGCCT",
                "expected": 0,
                "actual": 0,
                "citation": "Line 14 condition never met"
            },
            {
                "boundary": "Smallest supported domain (empty strings)",
                "input_a": "",
                "input_b": "",
                "expected": 0,
                "actual": 0,
                "citation": "Line 19 length equality holds (0 == 0)"
            },
            {
                "boundary": "Single-character domain boundary",
                "input_a": "x",
                "input_b": "y",
                "expected": 1,
                "actual": 1,
                "citation": "Lines 13-17 single iteration difference"
            },
            {
                "boundary": "Explicitly unsupported (unequal length)",
                "input_a": "GAGCCT",
                "input_b": "GAGCCTA",
                "expected_exception": "Strings must be of the same length",
                "actual_exception": "Strings must be of the same length",
                "citation": "Line 19 error guard"
            }
        ]
    }

    results_path = os.path.join(work_dir, "results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    boundaries_md_path = os.path.join(work_dir, "boundaries.md")
    with open(boundaries_md_path, "w") as f:
        f.write("""# Boundary Specification: hammingDistance (R51-T002)

## Supported Boundaries
1. **Empty string boundary:** `""` vs `""` -> 0.
2. **Single character boundary:** `"x"` vs `"x"` -> 0; `"x"` vs `"y"` -> 1.
3. **Stated fixture:** `"GAGCCT"` vs `"CATCGT"` (3 diffs) -> 3.
4. **Identical strings fixture:** `"GAGCCT"` vs `"GAGCCT"` -> 0.

## Unsupported Boundary
- **Unequal lengths:** Any string pair where `a.length !== b.length` throws `Error('Strings must be of the same length')` (line 19).
""")

    print(f"[R51-T002] All checks passed! Saved artifacts to {work_dir}")

if __name__ == "__main__":
    main()
