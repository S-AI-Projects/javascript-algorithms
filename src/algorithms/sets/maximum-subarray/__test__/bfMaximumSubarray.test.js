import bfMaximumSubarray from '../bfMaximumSubarray';

describe('bfMaximumSubarray', () => {
  it('should find maximum subarray using the brute force algorithm', () => {
    expect(bfMaximumSubarray([])).toEqual([]);
    expect(bfMaximumSubarray([0, 0])).toEqual([0]);
    expect(bfMaximumSubarray([0, 0, 1])).toEqual([0, 0, 1]);
    expect(bfMaximumSubarray([0, 0, 1, 2])).toEqual([0, 0, 1, 2]);
    expect(bfMaximumSubarray([0, 0, -1, 2])).toEqual([2]);
    expect(bfMaximumSubarray([-1, -2, -3, -4, -5])).toEqual([-1]);
    expect(bfMaximumSubarray([1, 2, 3, 2, 3, 4, 5])).toEqual([1, 2, 3, 2, 3, 4, 5]);
    expect(bfMaximumSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toEqual([4, -1, 2, 1]);
    expect(bfMaximumSubarray([-2, -3, 4, -1, -2, 1, 5, -3])).toEqual([4, -1, -2, 1, 5]);
    expect(bfMaximumSubarray([1, -3, 2, -5, 7, 6, -1, 4, 11, -23])).toEqual([7, 6, -1, 4, 11]);
  });

  describe('property & invariant tests (R51-T044)', () => {
    // PRNG helper with fixed seed for deterministic, reproducible property tests
    function createMulberry32(seed) {
      let s = seed | 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function isContiguousSubarray(sub, arr) {
      if (sub.length === 0) return true;
      for (let i = 0; i <= arr.length - sub.length; i += 1) {
        let matches = true;
        for (let j = 0; j < sub.length; j += 1) {
          if (arr[i + j] !== sub[j]) {
            matches = false;
            break;
          }
        }
        if (matches) return true;
      }
      return false;
    }

    function sum(arr) {
      return arr.reduce((acc, val) => acc + val, 0);
    }

    function maxContiguousSum(arr) {
      if (arr.length === 0) return 0;
      let maxSum = -Infinity;
      for (let start = 0; start < arr.length; start += 1) {
        let currentSum = 0;
        for (let end = start; end < arr.length; end += 1) {
          currentSum += arr[end];
          if (currentSum > maxSum) {
            maxSum = currentSum;
          }
        }
      }
      return maxSum;
    }

    it('satisfies invariants on smallest valid input [] (preconditions: lines 8, 13, 25)', () => {
      // Preconditions:
      // - Line 8: inputArray is an array ([])
      // - Line 13: startIndex < inputArray.length (loop does not execute)
      // - Line 25: inputArray.slice(0, 0) returns fresh empty array []
      const input = [];
      const inputSnapshot = [...input];

      const result = bfMaximumSubarray(input);

      // Invariant 1: Contiguous
      expect(isContiguousSubarray(result, input)).toBe(true);
      // Invariant 2: Maximal sum
      expect(sum(result)).toBe(0);
      expect(result).toEqual([]);
      // Invariant 3: Immutability of input
      expect(input).toEqual(inputSnapshot);
    });

    it('satisfies invariants on ordinary input (preconditions: lines 8, 13, 17, 25)', () => {
      // Preconditions:
      // - Line 8: inputArray is an array of numbers
      // - Line 13: iterates over all start indices
      // - Line 17: subarraySum > maxSubarraySum selects maximal slice [4, -1, 2, 1] (sum = 6)
      // - Line 25: returns fresh slice [4, -1, 2, 1] without mutating input
      const input = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
      const inputSnapshot = [...input];

      const result = bfMaximumSubarray(input);

      // Invariant 1: Contiguous subsegment
      expect(isContiguousSubarray(result, input)).toBe(true);
      // Invariant 2: Maximal sum
      expect(sum(result)).toBe(6);
      expect(sum(result)).toBe(maxContiguousSum(input));
      expect(result).toEqual([4, -1, 2, 1]);
      // Invariant 3: Immutability of input
      expect(input).toEqual(inputSnapshot);
      // Invariant 4: Fresh array reference
      expect(result).not.toBe(input);
    });

    it('satisfies all invariants across 100 generated cases (Mulberry32 seed 42)', () => {
      const rng = createMulberry32(42);
      const numCases = 100;
      let readableSmallCase = null;

      for (let caseIdx = 0; caseIdx < numCases; caseIdx += 1) {
        const length = Math.floor(rng() * 12) + 1; // 1 to 12
        const input = [];
        for (let i = 0; i < length; i += 1) {
          input.push(Math.floor(rng() * 101) - 50); // -50 to 50
        }

        const inputSnapshot = [...input];
        const result = bfMaximumSubarray(input);

        // Record readable small case
        if (caseIdx === 0) {
          readableSmallCase = {
            input: [...input],
            result: [...result],
            sum: sum(result),
          };
        }

        // Invariant 1: Output is contiguous subarray of input
        expect(isContiguousSubarray(result, input)).toBe(true);

        // Invariant 2: Sum is maximal over all contiguous subarrays
        expect(sum(result)).toBe(maxContiguousSum(input));

        // Invariant 3: Input array was not mutated
        expect(input).toEqual(inputSnapshot);

        // Invariant 4: Non-empty result for non-empty input
        expect(result.length).toBeGreaterThan(0);
      }

      // Assert readable small case exists and has valid values
      expect(readableSmallCase).not.toBeNull();
      expect(readableSmallCase.input.length).toBeGreaterThan(0);
    });

    it('fails when relevant invariant is deliberately broken in a mutant', () => {
      // Deliberate mutant: drops the first element of the maximum subarray
      function mutantBfMaximumSubarray(inputArray) {
        const res = bfMaximumSubarray(inputArray);
        return res.slice(1);
      }

      const input = [10, 20, 30];
      const mutantResult = mutantBfMaximumSubarray(input);

      // Invariant 2 (sum maximality) fails on the mutant
      expect(sum(mutantResult)).not.toBe(maxContiguousSum(input));
    });
  });
});
