# Shortest Common Supersequence

The shortest common supersequence (SCS) of two sequences `X` and `Y` 
is the shortest sequence which has `X` and `Y` as subsequences.

In other words assume we're given two strings str1 and str2, find 
the shortest string that has both str1 and str2 as subsequences.

This is a problem closely related to the longest common 
subsequence problem.

## Supported Inputs and Boundaries

`shortestCommonSupersequence` in [shortestCommonSupersequence.js](./shortestCommonSupersequence.js) computes the shortest common supersequence of two input sequences without mutating the input arrays.

### Supported Domain

- **Input sequences (`set1`, `set2`)**: Arrays of elements (typically strings/characters).
- **Smallest valid input**: Both inputs are empty arrays (`[]`, `[]`), yielding `[]`.
- **Boundaries**: One sequence empty and one non-empty; single-element identical sequences; single-element disjoint sequences.
- **Mutation & Purity**: Pure function; input arrays are never mutated.

| Input `set1` | Input `set2` | Expected result | Classification | Source contract citation |
| --- | --- | --- | --- | --- |
| `[]` | `[]` | `[]` | Smallest valid input (both empty) | [README.md:3-4](README.md), [shortestCommonSupersequence.js:29-31](./shortestCommonSupersequence.js#L29-L31) |
| `[]` | `['A']` | `['A']` | Boundary: first sequence empty, second singleton | [README.md:3-4](README.md), [shortestCommonSupersequence.js:29-31](./shortestCommonSupersequence.js#L29-L31) |
| `['A']` | `[]` | `['A']` | Boundary: first sequence singleton, second empty | [README.md:3-4](README.md), [shortestCommonSupersequence.js:29-31](./shortestCommonSupersequence.js#L29-L31) |
| `['A']` | `['A']` | `['A']` | Boundary: single-element identical sequences | [README.md:3-4](README.md), [shortestCommonSupersequence.js:23-84](./shortestCommonSupersequence.js#L23-L84) |
| `['A']` | `['B']` | `['A', 'B']` | Boundary: single-element disjoint sequences | [README.md:3-4](README.md), [shortestCommonSupersequence.js:29-31](./shortestCommonSupersequence.js#L29-L31) |
| `['A', 'B', 'C']` | `['D', 'E', 'F']` | `['A', 'B', 'C', 'D', 'E', 'F']` | Interior: disjoint multi-element sequences (empty LCS) | [shortestCommonSupersequence.js:29-31](./shortestCommonSupersequence.js#L29-L31) |
| `['G', 'E', 'E', 'K']` | `['E', 'K', 'E']` | `['G', 'E', 'K', 'E', 'K']` | Ordinary input from README.md | [README.md:37-38](README.md), [shortestCommonSupersequence.js:23-84](./shortestCommonSupersequence.js#L23-L84) |
| `['A', 'G', 'G', 'T', 'A', 'B']` | `['G', 'X', 'T', 'X', 'A', 'Y', 'B']` | `['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B']` | Ordinary input from README.md | [README.md:40-42](README.md), [shortestCommonSupersequence.js:23-84](./shortestCommonSupersequence.js#L23-L84) |

## Example

```
Input:   str1 = "geek",  str2 = "eke"
Output: "geeke"

Input:   str1 = "AGGTAB",  str2 = "GXTXAYB"
Output:  "AGXGTXAYB"
```

## References

- [GeeksForGeeks](https://www.geeksforgeeks.org/shortest-common-supersequence/)
