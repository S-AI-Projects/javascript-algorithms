import isPowerOfTwo from '../isPowerOfTwo';

describe('isPowerOfTwo', () => {
  it('should check if the number is made by multiplying twos', () => {
    expect(isPowerOfTwo(-1)).toBe(false);
    expect(isPowerOfTwo(0)).toBe(false);
    expect(isPowerOfTwo(1)).toBe(true);
    expect(isPowerOfTwo(2)).toBe(true);
    expect(isPowerOfTwo(3)).toBe(false);
    expect(isPowerOfTwo(4)).toBe(true);
    expect(isPowerOfTwo(5)).toBe(false);
    expect(isPowerOfTwo(6)).toBe(false);
    expect(isPowerOfTwo(7)).toBe(false);
    expect(isPowerOfTwo(8)).toBe(true);
    expect(isPowerOfTwo(10)).toBe(false);
    expect(isPowerOfTwo(12)).toBe(false);
    expect(isPowerOfTwo(16)).toBe(true);
    expect(isPowerOfTwo(31)).toBe(false);
    expect(isPowerOfTwo(64)).toBe(true);
    expect(isPowerOfTwo(1024)).toBe(true);
    expect(isPowerOfTwo(1023)).toBe(false);
  });

  describe('mutation-resistant regression tests (R51-T010)', () => {
    it('protected condition: number < 1 base boundary allows 1 (2^0) (preconditions: lines 16, 18)', () => {
      // Smallest valid input fixture: 1 (2^0)
      // Plausible mistake: changing `number < 1` to `number <= 1` at line 18
      // would incorrectly cause isPowerOfTwo(1) to return false.
      expect(isPowerOfTwo(1)).toBe(true);
    });

    it('ordinary input: powers of two vs non-powers of two', () => {
      // Ordinary valid inputs
      expect(isPowerOfTwo(8)).toBe(true);
      expect(isPowerOfTwo(16)).toBe(true);
      expect(isPowerOfTwo(32)).toBe(true);

      // Ordinary non-powers
      expect(isPowerOfTwo(6)).toBe(false);
      expect(isPowerOfTwo(14)).toBe(false);
    });

    it('boundary validation: zero and negative numbers return false (lines 18-20)', () => {
      expect(isPowerOfTwo(0)).toBe(false);
      expect(isPowerOfTwo(-1)).toBe(false);
      expect(isPowerOfTwo(-8)).toBe(false);
    });
  });
});
