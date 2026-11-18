import pascalTriangle from '../pascalTriangle';

describe('pascalTriangle', () => {
  it('should calculate Pascal Triangle coefficients for specific line number', () => {
    expect(pascalTriangle(0)).toEqual([1]);
    expect(pascalTriangle(1)).toEqual([1, 1]);
    expect(pascalTriangle(2)).toEqual([1, 2, 1]);
    expect(pascalTriangle(3)).toEqual([1, 3, 3, 1]);
    expect(pascalTriangle(4)).toEqual([1, 4, 6, 4, 1]);
    expect(pascalTriangle(5)).toEqual([1, 5, 10, 10, 5, 1]);
    expect(pascalTriangle(6)).toEqual([1, 6, 15, 20, 15, 6, 1]);
    expect(pascalTriangle(7)).toEqual([1, 7, 21, 35, 35, 21, 7, 1]);
  });

  describe('supported domain fixtures and preconditions', () => {
    // Precondition source: pascalTriangle.js line 2 (@param {number} lineNumber - zero based)
    // Smallest valid input: lineNumber = 0
    // Independently calculated: row 0 contains only C(0, 0) = 1.
    it('calculates coefficients for the smallest valid input (lineNumber = 0)', () => {
      // Precondition established at pascalTriangle.js:2
      const smallestInput = 0;
      const expected = [1];
      expect(pascalTriangle(smallestInput)).toEqual(expected);
    });

    // Precondition source: pascalTriangle.js line 2 (@param {number} lineNumber - zero based)
    // Ordinary input: lineNumber = 4
    // Independently calculated:
    // C(4, 0) = 1
    // C(4, 1) = 1 * (4 - 1 + 1) / 1 = 4
    // C(4, 2) = 4 * (4 - 2 + 1) / 2 = 6
    // C(4, 3) = 6 * (4 - 3 + 1) / 3 = 4
    // C(4, 4) = 4 * (4 - 4 + 1) / 4 = 1
    it('calculates coefficients for an ordinary input (lineNumber = 4)', () => {
      // Precondition established at pascalTriangle.js:2
      const ordinaryInput = 4;
      const expected = [1, 4, 6, 4, 1];
      expect(pascalTriangle(ordinaryInput)).toEqual(expected);
    });

    // Verifies purity and that repeated calls return new array instances without argument mutation
    it('is a deterministic pure function and preserves argument non-mutation', () => {
      const input = 4;
      const result1 = pascalTriangle(input);
      const result2 = pascalTriangle(input);
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2);
      expect(input).toBe(4);
    });
  });
});
