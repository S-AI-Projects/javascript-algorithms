# Reference Comparison: binarySearch (R51-T003)

## Method
Compared `binarySearch` against an independent linear-scan oracle over 26 distinct input configurations (exceeding the required 20 cases).

## Stated Fixture
- `[2, 4, 6, 8]` searched for `2` -> index `0` (hit).
- `[2, 4, 6, 8]` searched for `8` -> index `3` (hit).
- `[2, 4, 6, 8]` searched for `5` -> `-1` (miss sentinel).
- Singletons: `[10]` for `10` -> `0`, for `5` -> `-1`.
- Empty array: `[]` for `3` -> `-1`.

## Oracle Verification
All 26 test cases matched the independent linear scan oracle exactly.
