# Invariants: kNN (R51-T004)

## Documented Invariants
1. **Homogeneous Labels Invariant:** When all points in `dataSet` have the identical class label `L`, `kNN` must return `L` for any valid query point and any valid `k`.
2. **Immutability Invariant:** Neither `dataSet`, `labels`, nor `toClassify` are mutated during execution.
3. **Shape & Type Invariant:** The return value is always a numeric class label from the candidate labels.

## Verification
- Verified on smallest valid input `[[0, 0]]`, `[1]`, `k=1` -> returns `1`.
- Verified on ordinary input `[[1, 1], [2, 2], [10, 10]]`, `[1, 1, 2]`, `k=3` -> returns `1`.
- Property tested over 100 bounded valid pseudo-random cases generated with fixed seed `12345`.
- Invariant check correctly detects and fails when an implementation returns an erroneous class.
