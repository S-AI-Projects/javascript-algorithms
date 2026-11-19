# Mutation Analysis: isPowerOfTwo (R51-T010)

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
