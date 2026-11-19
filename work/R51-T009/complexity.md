# Complexity Experiment: buildZArray (R51-T009)

## Input Size Variable
- Let $N = \text{zString.length}$ (line 21).

## Theoretical Worst-Case Claim
- Time Complexity: $O(N)$
- Space Complexity: $O(N)$
- In each step of the algorithm, `zBoxRightIndex` only advances from $0$ to $N-1$ and is never rewound backwards. Thus, the total number of character comparisons across the entire execution is strictly bounded by $2N$.

## Empirical Measurements (5 Repetitions per Size)
- $N = 1000$: Median = 0.035 ms, Comparisons/N <= 1.19
- $N = 5000$: Median = 0.211 ms, Comparisons/N <= 1.18
- $N = 20000$: Median = 0.864 ms, Comparisons/N <= 1.18

Linear scaling is observed with comparisons scaling proportionally to $N$ with no superlinear overhead.
