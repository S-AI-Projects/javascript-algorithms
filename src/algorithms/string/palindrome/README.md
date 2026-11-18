# Palindrome Check

A [Palindrome](https://en.wikipedia.org/wiki/Palindrome) is a string that reads the same forwards and backwards.
This means that the second half of the string is the reverse of the
first half.

## Examples

The following are palindromes (thus would return `TRUE`):

```
- "a"
- "pop"     ->  p + o + p
- "deed"    ->  de + ed
- "kayak"   ->  ka + y + ak
- "racecar" ->  rac + e + car
```

The following are NOT palindromes (thus would return `FALSE`):

```
- "rad"
- "dodo"
- "polo"
```

## Normalization Specification

**Normalization is not performed by this function.**
Characters are compared strictly and directly by position (`string[left] !== string[right]`).
- Case folding is not applied (e.g. `"Aba"` returns `false`).
- Whitespace and punctuation are preserved and checked as distinct characters (e.g. `"a ba"` returns `false`).

## Worked Examples and State Transitions

The algorithm initializes two pointers, `left = 0` and `right = string.length - 1`, and contracts inward until they meet or cross (`left >= right`).

- **Decisive Failure Transition**: At any step, if `string[left] !== string[right]`, a character mismatch immediately returns `false`.
- **Decisive Success Transition**: If the pointers meet or cross (`left >= right`) without a mismatch, the string is confirmed to be a palindrome, returning `true`.

| Input | Length | Initial State | Intermediate Step(s) | Exit Condition | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `""` | 0 | `left=0`, `right=-1` | None | `0 < -1` is false (loop skipped) | `true` |
| `"a"` | 1 | `left=0`, `right=0` | None | `0 < 0` is false (pointers meet) | `true` |
| `"aba"` | 3 | `left=0`, `right=2` | Step 1: `str[0] ('a') === str[2] ('a')` &rarr; `left=1`, `right=1` | `1 < 1` is false (converged at `'b'`) | `true` |
| `"ab"` | 2 | `left=0`, `right=1` | Step 1: `str[0] ('a') !== str[1] ('b')` | Decisive mismatch at index 0 and 1 | `false` |
| `"abba"` | 4 | `left=0`, `right=3` | Step 1: `str[0] ('a') === str[3] ('a')` &rarr; `left=1`, `right=2`<br>Step 2: `str[1] ('b') === str[2] ('b')` &rarr; `left=2`, `right=1` | `2 < 1` is false (pointers crossed) | `true` |

## References

- [GeeksForGeeks - Check if a number is Palindrome](https://www.geeksforgeeks.org/check-if-a-number-is-palindrome/)
