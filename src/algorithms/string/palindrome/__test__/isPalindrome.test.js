import isPalindrome from '../isPalindrome';

describe('palindromeCheck', () => {
  it('should return whether or not the string is a palindrome', () => {
    expect(isPalindrome('a')).toBe(true);
    expect(isPalindrome('pop')).toBe(true);
    expect(isPalindrome('deed')).toBe(true);
    expect(isPalindrome('kayak')).toBe(true);
    expect(isPalindrome('racecar')).toBe(true);

    expect(isPalindrome('rad')).toBe(false);
    expect(isPalindrome('dodo')).toBe(false);
    expect(isPalindrome('polo')).toBe(false);
  });

  describe('isPalindrome worked examples and fixtures', () => {
    // Fixture 1: empty string ""
    it('returns true for the empty string fixture ("")', () => {
      // Input: "", length 0. left = 0, right = -1. Loop condition 0 < -1 is false.
      expect(isPalindrome('')).toBe(true);
    });

    // Fixture 2: single character "a"
    it('returns true for single character fixture ("a")', () => {
      // Input: "a", length 1. left = 0, right = 0. Loop condition 0 < 0 is false.
      expect(isPalindrome('a')).toBe(true);
    });

    // Fixture 3: odd-length palindrome "aba"
    it('returns true for odd-length palindrome fixture ("aba")', () => {
      // Input: "aba", length 3. left = 0, right = 2.
      // string[0] ('a') === string[2] ('a') -> left = 1, right = 1.
      // Pointers meet at middle 'b'; returns true.
      expect(isPalindrome('aba')).toBe(true);
    });

    // Fixture 4: non-palindrome "ab"
    it('returns false for non-palindrome fixture ("ab")', () => {
      // Input: "ab", length 2. left = 0, right = 1.
      // string[0] ('a') !== string[1] ('b') -> decisive mismatch exit; returns false.
      expect(isPalindrome('ab')).toBe(false);
    });

    // Fixture 5: even-length palindrome "abba"
    it('returns true for even-length palindrome fixture ("abba")', () => {
      // Input: "abba", length 4. left = 0, right = 3.
      // Step 1: string[0] ('a') === string[3] ('a') -> left = 1, right = 2.
      // Step 2: string[1] ('b') === string[2] ('b') -> left = 2, right = 1.
      // Pointers cross; returns true.
      expect(isPalindrome('abba')).toBe(true);
    });

    // Normalization check: confirms normalization is NOT performed
    it('does not normalize input, comparing characters strictly by index', () => {
      // Case sensitivity: 'A' !== 'a' without lowercasing normalization
      expect(isPalindrome('Aba')).toBe(false);
      // Whitespace sensitivity: spaces are not stripped
      expect(isPalindrome('a ba')).toBe(false);
    });

    // Executed documentation example assertion
    it('executed documentation example: verifies all documented cases from JSDoc', () => {
      const documentedExamples = [
        { input: '', expected: true, reason: 'empty string: left=0, right=-1, loop skipped' },
        { input: 'a', expected: true, reason: 'single char: left=0, right=0, loop skipped' },
        { input: 'aba', expected: true, reason: 'odd-length: matched ends, pointers converge at index 1' },
        { input: 'ab', expected: false, reason: 'non-palindrome: mismatch at index pair (0, 1)' },
        { input: 'abba', expected: true, reason: 'even-length: matched ends and inner pairs, pointers cross' },
      ];

      documentedExamples.forEach(({ input, expected }) => {
        expect(isPalindrome(input)).toBe(expected);
      });
    });
  });
});
