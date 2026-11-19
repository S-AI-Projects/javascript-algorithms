import binarySearch from '../binarySearch';

describe('binarySearch', () => {
  it('should search number in sorted array', () => {
    expect(binarySearch([], 1)).toBe(-1);
    expect(binarySearch([1], 1)).toBe(0);
    expect(binarySearch([1, 2], 1)).toBe(0);
    expect(binarySearch([1, 2], 2)).toBe(1);
    expect(binarySearch([1, 5, 10, 12], 1)).toBe(0);
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 17)).toBe(5);
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 1)).toBe(0);
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 100)).toBe(7);
    expect(binarySearch([1, 5, 10, 12, 14, 17, 22, 100], 0)).toBe(-1);
  });

  it('should search object in sorted array', () => {
    const sortedArrayOfObjects = [
      { key: 1, value: 'value1' },
      { key: 2, value: 'value2' },
      { key: 3, value: 'value3' },
    ];

    const comparator = (a, b) => {
      if (a.key === b.key) return 0;
      return a.key < b.key ? -1 : 1;
    };

    expect(binarySearch([], { key: 1 }, comparator)).toBe(-1);
    expect(binarySearch(sortedArrayOfObjects, { key: 4 }, comparator)).toBe(-1);
    expect(binarySearch(sortedArrayOfObjects, { key: 1 }, comparator)).toBe(0);
    expect(binarySearch(sortedArrayOfObjects, { key: 2 }, comparator)).toBe(1);
    expect(binarySearch(sortedArrayOfObjects, { key: 3 }, comparator)).toBe(2);
  });

  describe('reference comparison regression tests (R51-T003)', () => {
    it('stated fixture: search [2, 4, 6, 8] for 2, 8, 5, plus singleton and empty', () => {
      const fixture = [2, 4, 6, 8];
      expect(binarySearch(fixture, 2)).toBe(0);
      expect(binarySearch(fixture, 8)).toBe(3);
      expect(binarySearch(fixture, 5)).toBe(-1);

      // Singleton tests
      expect(binarySearch([10], 10)).toBe(0);
      expect(binarySearch([10], 5)).toBe(-1);

      // Empty collection test
      expect(binarySearch([], 3)).toBe(-1);
    });

    it('cross-checks at least 20 small valid inputs against independent oracle', () => {
      // Independent reference oracle using linear scan
      function referenceLinearSearch(arr, target) {
        for (let i = 0; i < arr.length; i += 1) {
          if (arr[i] === target) return i;
        }
        return -1;
      }

      const testCases = [
        { arr: [], target: 0 },
        { arr: [], target: 5 },
        { arr: [7], target: 7 },
        { arr: [7], target: 3 },
        { arr: [7], target: 9 },
        { arr: [1, 3], target: 1 },
        { arr: [1, 3], target: 3 },
        { arr: [1, 3], target: 0 },
        { arr: [1, 3], target: 2 },
        { arr: [1, 3], target: 4 },
        { arr: [10, 20, 30], target: 10 },
        { arr: [10, 20, 30], target: 20 },
        { arr: [10, 20, 30], target: 30 },
        { arr: [10, 20, 30], target: 15 },
        { arr: [10, 20, 30], target: 35 },
        { arr: [2, 4, 6, 8], target: 2 },
        { arr: [2, 4, 6, 8], target: 4 },
        { arr: [2, 4, 6, 8], target: 6 },
        { arr: [2, 4, 6, 8], target: 8 },
        { arr: [2, 4, 6, 8], target: 1 },
        { arr: [2, 4, 6, 8], target: 5 },
        { arr: [2, 4, 6, 8], target: 9 },
        { arr: [1, 3, 5, 7, 9], target: 5 },
        { arr: [1, 3, 5, 7, 9], target: 1 },
        { arr: [1, 3, 5, 7, 9], target: 9 },
        { arr: [1, 3, 5, 7, 9], target: 6 },
      ];

      expect(testCases.length).toBeGreaterThanOrEqual(20);

      testCases.forEach(({ arr, target }) => {
        const expected = referenceLinearSearch(arr, target);
        const actual = binarySearch(arr, target);

        if (expected === -1) {
          expect(actual).toBe(-1);
        } else {
          expect(arr[actual]).toBe(target);
          expect(actual).toBe(expected);
        }
      });
    });

    it('handles duplicate elements conforming to contract', () => {
      const arrWithDups = [1, 2, 2, 2, 3];
      const result = binarySearch(arrWithDups, 2);
      expect(arrWithDups[result]).toBe(2);
      expect([1, 2, 3]).toContain(result);
    });
  });
});
