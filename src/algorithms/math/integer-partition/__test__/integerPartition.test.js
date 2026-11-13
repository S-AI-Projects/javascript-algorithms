import integerPartition from '../integerPartition';

describe('integerPartition', () => {
  it('should partition the number', () => {
    expect(integerPartition(1)).toBe(1);
    expect(integerPartition(2)).toBe(2);
    expect(integerPartition(3)).toBe(3);
    expect(integerPartition(4)).toBe(5);
    expect(integerPartition(5)).toBe(7);
    expect(integerPartition(6)).toBe(11);
    expect(integerPartition(7)).toBe(15);
    expect(integerPartition(8)).toBe(22);
  });

  // Failure-path / empty-result coverage for integerPartition
  //
  // Source line establishing the precondition:
  //   integerPartition.js line 5 — `export default function integerPartition(number)`
  //   The function accepts any non-negative integer. The smallest valid input is 0.
  //
  // When number = 0:
  //   • The partition matrix is Array(1) × Array(1), i.e. a single cell.
  //   • The column-initialisation loop (line 22) sets partitionMatrix[0][0] = 1.
  //   • No row-fill or DP loop body executes (both loops start at index 1).
  //   • Therefore integerPartition(0) returns 1 — there is exactly one way
  //     to partition 0: the empty sum.
  //
  // This exercises the absent-result / boundary branch where no summand or
  // number loops execute, confirming the base-case sentinel is returned and
  // the function does not throw, return null, or return undefined.
  it('should return 1 for the smallest valid input (number = 0) — empty-partition base case', () => {
    // Smallest valid input: 0
    // Independently calculated expected output: 1 (the empty partition)
    // Source precondition: integerPartition.js line 5 (function signature accepts number >= 0)
    // Source base-case sentinel: integerPartition.js line 22 (partitionMatrix[summandIndex][0] = 1)
    const result = integerPartition(0);
    expect(result).toBe(1);
  });

  it('should still return correct result for an ordinary input after the base case — integerPartition(4) = 5', () => {
    // Ordinary input: 4
    // Independently calculated expected output: 5
    //   Partitions of 4: {4}, {3+1}, {2+2}, {2+1+1}, {1+1+1+1} → 5 ways
    // Source precondition: integerPartition.js line 5 (function signature)
    const result = integerPartition(4);
    expect(result).toBe(5);
  });
});
