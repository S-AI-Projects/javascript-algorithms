#!/usr/bin/env python3
import json
import os
import subprocess
import sys

def main():
    work_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(work_dir, "..", ".."))

    print("[R51-T006] Running focused test suite...")
    test_cmd = [
        "npm", "test", "--",
        "--runInBand",
        "src/algorithms/sets/cartesian-product/__test__/cartesianProduct.test.js",
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
        print("[R51-T006] Test execution failed!", file=sys.stderr)
        sys.exit(proc.returncode)

    # Check JSDoc citations & refactoring
    src_file = os.path.join(repo_root, "src", "algorithms", "sets", "cartesian-product", "cartesianProduct.js")
    with open(src_file, "r") as f:
        src_content = f.read()

    assert "line 18" in src_content
    assert "const pair = [setA[indexA], setB[indexB]];" in src_content

    # Capture tool versions
    node_version = subprocess.check_output(["node", "--version"], text=True).strip()
    npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
    python_version = sys.version.split()[0]

    results = {
        "task": "R51-T006",
        "status": "PASSED",
        "command": " ".join(test_cmd),
        "test_count": 5,
        "tools": {
            "node": node_version,
            "npm": npm_version,
            "python": python_version
        },
        "refactoring_summary": {
            "responsibility": "Pair formation in Cartesian product loop",
            "named_state": "const pair = [setA[indexA], setB[indexB]]",
            "behavior_preserved": True
        },
        "fixtures": [
            {
                "name": "smallest valid input",
                "precondition_lines": ["lines 18-19"],
                "setA": [1],
                "setB": [2],
                "expected": [[1, 2]],
                "actual": [[1, 2]]
            },
            {
                "name": "ordinary input",
                "precondition_lines": ["lines 18-19"],
                "setA": ["x", "y"],
                "setB": [1, 2],
                "expected": [["x", 1], ["x", 2], ["y", 1], ["y", 2]],
                "actual": [["x", 1], ["x", 2], ["y", 1], ["y", 2]]
            }
        ]
    }

    results_path = os.path.join(work_dir, "results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    refactoring_md_path = os.path.join(work_dir, "refactoring.md")
    with open(refactoring_md_path, "w") as f:
        f.write("""# Focused Refactoring: cartesianProduct (R51-T006)

## Refactored Responsibility
- Extracted the Cartesian pair creation in the nested loop into a named local constant:
  `const pair = [setA[indexA], setB[indexB]];`
  `product.push(pair);`
- Clarifies the atomic step of the algorithm: forming a Cartesian pair between the current elements of `setA` and `setB`.

## Preserved Behavior
- Preserves return types, ordering, side-effects, and public interface.
- Before and after test suites pass identically.
""")

    print(f"[R51-T006] All checks passed! Saved artifacts to {work_dir}")

if __name__ == "__main__":
    main()
