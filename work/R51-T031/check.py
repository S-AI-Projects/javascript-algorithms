import subprocess
import sys

command = [
    "npm",
    "test",
    "--",
    "--runInBand",
    "src/algorithms/sets/knapsack-problem/__test__/Knapsack.test.js",
]

result = subprocess.run(command, check=False)

if result.returncode != 0:
    print("Knapsack tests failed.")
    sys.exit(result.returncode)

print("All Knapsack tests passed.")
