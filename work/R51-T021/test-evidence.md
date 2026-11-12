# R51-T021 Test Evidence

## Tool versions
- Node.js: v26.13.1
- npm: 11.20.0
- Python: 3.14.7
- Jest: 30.1.3

## Test command
python3 work/R51-T021/check.py

## Fixtures and results

| Input | Expected callback values | Actual callback values | Result |
|---|---|---|---|
| Empty list | [] | [] | PASS |
| A | [A] | [A] | PASS |
| A -> B -> C | [C, B, A] | [C, B, A] | PASS |
| A -> B -> A | [A, B, A] | [A, B, A] | PASS |

## Additional assertions
- Return value is undefined for all four cases.
- Empty list retains null head and tail.
- Single-node list retains its original node and null next link.
- Three-node list retains its original head, tail, values, and links.
- Repeated-value list retains its original node connections.

## Final runner result
- Test suites: 1 passed, 1 total
- Tests: 4 passed, 4 total
- Failures: 0
- Snapshots: 0
- Runner exit status: 0

## Baseline
- Existing test suites: 1 passed
- Existing tests: 1 passed
- No baseline failures.
