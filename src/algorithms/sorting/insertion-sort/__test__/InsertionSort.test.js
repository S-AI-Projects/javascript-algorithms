import InsertionSort from '../InsertionSort';
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../../SortTester';

// ─── Seeded PRNG (mulberry32) — fixed seed for reproducibility (R51-T024) ───
function mulberry32(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let z = Math.imul(s ^ s >>> 15, 1 | s);
    z ^= z + Math.imul(z ^ z >>> 7, 61 | z);
    return ((z ^ z >>> 14) >>> 0) / 4294967296;
  };
}

// Generate `count` random arrays of length 1–20 with values in [-50, 50]
// using a fixed seed so the test is deterministic.
function generateCases(count, seed) {
  const rng = mulberry32(seed);
  const cases = [];
  for (let i = 0; i < count; i += 1) {
    const len = Math.floor(rng() * 20) + 1; // 1..20
    const arr = [];
    for (let j = 0; j < len; j += 1) {
      arr.push(Math.floor(rng() * 101) - 50); // -50..50
    }
    cases.push(arr);
  }
  return cases;
}

// Complexity constants.
const SORTED_ARRAY_VISITING_COUNT = 19;
const NOT_SORTED_ARRAY_VISITING_COUNT = 100;
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 209;
const EQUAL_ARRAY_VISITING_COUNT = 19;

describe('InsertionSort', () => {
  it('should sort array', () => {
    SortTester.testSort(InsertionSort);
  });

  it('should sort array with custom comparator', () => {
    SortTester.testSortWithCustomComparator(InsertionSort);
  });

  it('should do stable sorting', () => {
    SortTester.testSortStability(InsertionSort);
  });

  it('should sort negative numbers', () => {
    SortTester.testNegativeNumbersSort(InsertionSort);
  });

  it('should visit EQUAL array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    );
  });

  it('should visit SORTED array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    );
  });

  it('should visit NOT SORTED array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    );
  });

  it('should visit REVERSE SORTED array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      InsertionSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    );
  });

  // ─── Property tests (R51-T024) ────────────────────────────────────────────
  //
  // Source contract (InsertionSort.js):
  //   - Input mutation: InsertionSort.sort() clones the input (line 5: `[...originalArray]`),
  //     so the original array is NEVER mutated.
  //   - Return contract: returns the sorted clone (line 37: `return array`).
  //   - Sort order: ascending by default (comparator.lessThan, line 18).
  //
  // Invariants verified for every input:
  //   I1. Output is sorted in non-decreasing order.
  //   I2. Output preserves all element multiplicities (same multiset as input).
  //   I3. Original input array is not mutated.
  //   I4. Output length equals input length.
  //
  // Fixtures required by task spec (ascending interface confirmed above):
  //   [3,1,2]   → [1,2,3]
  //   [2,2,1]   → [1,2,2]
  //   [1,2,3]   → [1,2,3]  (already ordered)
  //   [3,2,1]   → [1,2,3]  (reversed)
  //   []        → []        (smallest supported collection)
  // ─────────────────────────────────────────────────────────────────────────

  describe('property tests — output ordered, multiplicities preserved, no mutation', () => {
    const sorter = new InsertionSort();

    // Helper: check I1 (sorted ascending)
    function isSortedAsc(arr) {
      for (let i = 0; i < arr.length - 1; i += 1) {
        if (arr[i] > arr[i + 1]) return false;
      }
      return true;
    }

    // Helper: check I2 (same multiset)
    function sameMultiset(a, b) {
      if (a.length !== b.length) return false;
      const freq = new Map();
      a.forEach((x) => freq.set(x, (freq.get(x) || 0) + 1));
      b.forEach((x) => freq.set(x, (freq.get(x) || 0) - 1));
      return [...freq.values()].every((v) => v === 0);
    }

    // ── Required fixtures ──────────────────────────────────────────────────

    it('fixture [3,1,2] → [1,2,3]: ordered, multiplicities preserved, no mutation', () => {
      // Precondition source: InsertionSort.js line 5 (clone) and line 37 (return)
      const input = [3, 1, 2];
      const snapshot = [...input];
      const result = sorter.sort(input);
      // Explicit expected value (independently calculated):
      expect(result).toEqual([1, 2, 3]);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameMultiset(result, snapshot)).toBe(true);
      expect(input).toEqual(snapshot); // I3: no mutation
    });

    it('fixture [2,2,1] → [1,2,2]: ordered, duplicates preserved, no mutation', () => {
      const input = [2, 2, 1];
      const snapshot = [...input];
      const result = sorter.sort(input);
      // Explicit expected value (independently calculated):
      expect(result).toEqual([1, 2, 2]);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameMultiset(result, snapshot)).toBe(true);
      expect(input).toEqual(snapshot);
    });

    it('fixture [1,2,3] already ordered → [1,2,3]: stable, no mutation', () => {
      const input = [1, 2, 3];
      const snapshot = [...input];
      const result = sorter.sort(input);
      // Explicit expected value: already sorted, unchanged
      expect(result).toEqual([1, 2, 3]);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameMultiset(result, snapshot)).toBe(true);
      expect(input).toEqual(snapshot);
    });

    it('fixture [3,2,1] reversed → [1,2,3]: ordered, no mutation', () => {
      const input = [3, 2, 1];
      const snapshot = [...input];
      const result = sorter.sort(input);
      // Explicit expected value (independently calculated):
      expect(result).toEqual([1, 2, 3]);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameMultiset(result, snapshot)).toBe(true);
      expect(input).toEqual(snapshot);
    });

    it('fixture [] smallest supported collection → []: ordered, no mutation', () => {
      // InsertionSort.js line 5 spreads originalArray; [] is valid (loop doesn't execute).
      const input = [];
      const result = sorter.sort(input);
      // Explicit expected value: empty array
      expect(result).toEqual([]);
      expect(isSortedAsc(result)).toBe(true);
      expect(input).toEqual([]); // no mutation
    });

    // ── Generator: 100 bounded valid cases, fixed seed 42 ─────────────────
    // Invariant justification: the generator restricts to arrays of integers
    // in [-50, 50] with length 1–20 — all within the actual input domain
    // (InsertionSort.js uses `comparator.lessThan` which works for any numbers).
    // A fixed seed (42) makes the test fully reproducible and deterministic.
    // The small readable case [3,1,2] is retained as a fixture above.

    it('property: 100 generated cases (seed 42) — output sorted, multiset preserved, no mutation', () => {
      const cases = generateCases(100, 42);
      cases.forEach((input) => {
        const snapshot = [...input];
        const result = sorter.sort(input);
        // I1: output is sorted ascending
        expect(isSortedAsc(result)).toBe(true);
        // I2: same multiset
        expect(sameMultiset(result, snapshot)).toBe(true);
        // I3: original not mutated
        expect(input).toEqual(snapshot);
        // I4: length preserved
        expect(result.length).toBe(snapshot.length);
      });
    });
  });
});
