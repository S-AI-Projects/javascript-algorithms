# R51-T036: linearSearch contract

## Observed before the refactor

- Public inputs: an array, a value to seek, and an optional comparator callback.
- Result: a new array containing every matching zero-based index, in input order. A miss returns `[]`.
- Mutation and callback effects: the input array is not changed. The comparator is called once per element, in input order, so callback side effects follow that order.
- External dependency: `Comparator` from `src/utils/comparator/Comparator.js`; equality is determined by `Comparator.equal`.
- Traversal: `forEach` visits the full array, including after matches, so duplicates are returned.

`before-evidence.json` contains the focused input, expected result, and observed result for each numeric fixture. The focused tests also lock down input preservation and custom comparator call order.

## Readability change

The equality predicate is named `matchesSeekElement` before traversal. The traversal, comparator calls, return shape, order, and mutation behavior remain the same. `after-evidence.json` and `check-summary.json` are produced by `python3 work/R51-T036/check.py`.
