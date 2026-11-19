# Boundary Specification: hammingDistance (R51-T002)

## Supported Boundaries
1. **Empty string boundary:** `""` vs `""` -> 0.
2. **Single character boundary:** `"x"` vs `"x"` -> 0; `"x"` vs `"y"` -> 1.
3. **Stated fixture:** `"GAGCCT"` vs `"CATCGT"` (3 diffs) -> 3.
4. **Identical strings fixture:** `"GAGCCT"` vs `"GAGCCT"` -> 0.

## Unsupported Boundary
- **Unequal lengths:** Any string pair where `a.length !== b.length` throws `Error('Strings must be of the same length')` (line 19).
