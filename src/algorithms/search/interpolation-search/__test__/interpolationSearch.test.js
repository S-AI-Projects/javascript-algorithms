import interpolationSearch from '../interpolationSearch';

describe('interpolationSearch', () => {
  it('should search elements in sorted array of numbers', () => {
    expect(interpolationSearch([], 1)).toBe(-1);
    expect(interpolationSearch([1], 1)).toBe(0);
    expect(interpolationSearch([1], 0)).toBe(-1);
    expect(interpolationSearch([1, 1], 1)).toBe(0);
    expect(interpolationSearch([1, 2], 1)).toBe(0);
    expect(interpolationSearch([1, 2], 2)).toBe(1);
    expect(interpolationSearch([10, 20, 30, 40, 50], 40)).toBe(3);
    expect(interpolationSearch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 14)).toBe(13);
    expect(interpolationSearch([1, 6, 7, 8, 12, 13, 14, 19, 21, 23, 24, 24, 24, 300], 24)).toBe(10);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 600)).toBe(-1);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 1)).toBe(0);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 2)).toBe(1);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 3)).toBe(2);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 700)).toBe(3);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 800)).toBe(4);
    expect(interpolationSearch([0, 2, 3, 700, 800, 1200, 1300, 1400, 1900], 1200)).toBe(5);
    expect(interpolationSearch([1, 2, 3, 700, 800, 1200, 1300, 1400, 19000], 800)).toBe(4);
    expect(interpolationSearch([0, 10, 11, 12, 13, 14, 15], 10)).toBe(1);
  });

  describe('deterministic repeatability and input isolation (R51-T005)', () => {
    it('stated fixture: search [2, 4, 6, 8] for 2, 8, 5, plus singleton and empty', () => {
      const fixture = [2, 4, 6, 8];
      expect(interpolationSearch(fixture, 2)).toBe(0);
      expect(interpolationSearch(fixture, 8)).toBe(3);
      expect(interpolationSearch(fixture, 5)).toBe(-1);

      // Singleton searches
      expect(interpolationSearch([7], 7)).toBe(0);
      expect(interpolationSearch([7], 3)).toBe(-1);

      // Empty collection search
      expect(interpolationSearch([], 4)).toBe(-1);
    });

    it('verifies repeated calls and input isolation across executions', () => {
      const fixture = [2, 4, 6, 8];
      const snapshotBefore = JSON.stringify(fixture);

      // Run 1: initial run in fresh state
      const run1 = interpolationSearch(fixture, 6);
      expect(run1).toBe(2);

      // Interleaved run with a different valid input
      const interleaved = interpolationSearch([10, 20, 30, 40], 30);
      expect(interleaved).toBe(2);

      // Run 2: repeated call on original input after interleaved run
      const run2 = interpolationSearch(fixture, 6);
      expect(run2).toBe(2);
      expect(run2).toBe(run1);

      // Input isolation: input array was never mutated
      expect(JSON.stringify(fixture)).toBe(snapshotBefore);
    });
  });
});
