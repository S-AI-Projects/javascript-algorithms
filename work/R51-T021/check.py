from pathlib import Path
import subprocess
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]

TEST_FILE = (
    "src/algorithms/linked-list/reverse-traversal/"
    "__test__/reverseTraversal.test.js"
)

COMMAND = [
    "npm",
    "test",
    "--",
    "--runInBand",
    TEST_FILE,
]

print(f"Running focused tests: {TEST_FILE}", flush=True)

result = subprocess.run(
    COMMAND,
    cwd=REPO_ROOT,
    check=False,
)

sys.exit(result.returncode)
