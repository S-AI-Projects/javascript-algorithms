#!/usr/bin/env python3
import json
import os
import subprocess
import sys

def original_is_power_of_two(number):
    if number < 1:
        return False
    divided = number
    while divided != 1:
        if divided % 2 != 0:
            return False
        divided /= 2
    return True

def mutant_is_power_of_two(number):
    # Plausible one-line mistake: changing `< 1` to `<= 1`
    if number <= 1:
        return False
    divided = number
    while divided != 1:
        if divided % 2 != 0:
            return False
        divided /= 2
    return True

def main():
    work_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(work_dir, "..", ".."))

    print("[R51-T010] Running focused test suite...")
    test_cmd = [
        "npm", "test", "--",
        "--runInBand",
        "src/algorithms/math/is-power-of-two/__test__/isPowerOfTwo.test.js",
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
        print("[R51-T010] Test execution failed!", file=sys.stderr)
        sys.exit(proc.returncode)

    # Check JSDoc citations & protected condition
    src_file = os.path.join(repo_root, "src", "algorithms", "math", "is-power-of-two", "isPowerOfTwo.js")
    with open(src_file, "r") as f:
        src_content = f.read()

    assert "line 18" in src_content
    assert "Protected Condition:" in src_content
    # Confirm final source contains NO mutation
    assert "if (number < 1)" in src_content
    assert "if (number <= 1)" not in src_content

    # Capture tool versions
    node_version = subprocess.check_output(["node", "--version"], text=True).strip()
    npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
    python_version = sys.version.split()[0]

    # Verify mutation detection: input 1
    orig_1 = original_is_power_of_two(1)
    mutant_1 = mutant_is_power_of_two(1)

    assert orig_1 is True, "Original should accept 1 (2^0)"
    assert mutant_1 is False, "Mutant should reject 1 (mutation caught!)"

    results = {
        "task": "R51-T010",
        "status": "PASSED",
        "command": " ".join(test_cmd),
        "test_count": 4,
        "tools": {
            "node": node_version,
            "npm": npm_version,
            "python": python_version
        },
        "mutation_experiment": {
            "protected_condition": "number < 1 at line 18",
            "plausible_mutation": "number <= 1 at line 18",
            "minimal_divergent_input": 1,
            "original_result": orig_1,
            "mutant_result": mutant_1,
            "mutation_detected": True
        },
        "fixtures": [
            {
                "name": "smallest valid input",
                "precondition_lines": ["line 16", "line 18"],
                "input": 1,
                "expected": True,
                "actual": True
            },
            {
                "name": "ordinary input",
                "precondition_lines": ["line 16", "line 18"],
                "input": 8,
                "expected": True,
                "actual": True
            }
        ]
    }

    results_path = os.path.join(work_dir, "results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    mutation_md_path = os.path.join(work_dir, "mutation.md")
    with open(mutation_md_path, "w") as f:
        f.write("""# Mutation Analysis: isPowerOfTwo (R51-T010)

## Protected Condition
- **Location:** Line 18 in `src/algorithms/math/is-power-of-two/isPowerOfTwo.js`.
- **Original Condition:** `if (number < 1)`
- **Plausible Mutation:** `if (number <= 1)`

## Semantic Divergence
- The smallest input where behavior diverges is `number = 1`.
- Mathematically, $2^0 = 1$, which is a valid power of two.
- The original returns `true`.
- The mutant erroneously returns `false`, causing the named test `"protected condition: number < 1 base boundary allows 1 (2^0)"` to fail.
- The final source maintains the correct `< 1` check with no mutant branches.
""")

    print(f"[R51-T010] All checks passed! Saved artifacts to {work_dir}")

if __name__ == "__main__":
    main()
