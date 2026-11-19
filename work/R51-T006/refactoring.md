# Focused Refactoring: cartesianProduct (R51-T006)

## Refactored Responsibility
- Extracted the Cartesian pair creation in the nested loop into a named local constant:
  `const pair = [setA[indexA], setB[indexB]];`
  `product.push(pair);`
- Clarifies the atomic step of the algorithm: forming a Cartesian pair between the current elements of `setA` and `setB`.

## Preserved Behavior
- Preserves return types, ordering, side-effects, and public interface.
- Before and after test suites pass identically.
