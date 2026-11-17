import regularExpressionMatching from '../regularExpressionMatching';

describe('regularExpressionMatching', () => {
  it('should match regular expressions in a string', () => {
    expect(regularExpressionMatching('', '')).toBe(true);
    expect(regularExpressionMatching('a', 'a')).toBe(true);
    expect(regularExpressionMatching('aa', 'aa')).toBe(true);
    expect(regularExpressionMatching('aab', 'aab')).toBe(true);
    expect(regularExpressionMatching('aab', 'aa.')).toBe(true);
    expect(regularExpressionMatching('aab', '.a.')).toBe(true);
    expect(regularExpressionMatching('aab', '...')).toBe(true);
    expect(regularExpressionMatching('a', 'a*')).toBe(true);
    expect(regularExpressionMatching('aaa', 'a*')).toBe(true);
    expect(regularExpressionMatching('aaab', 'a*b')).toBe(true);
    expect(regularExpressionMatching('aaabb', 'a*b*')).toBe(true);
    expect(regularExpressionMatching('aaabb', 'a*b*c*')).toBe(true);
    expect(regularExpressionMatching('', 'a*')).toBe(true);
    expect(regularExpressionMatching('xaabyc', 'xa*b.c')).toBe(true);
    expect(regularExpressionMatching('aab', 'c*a*b*')).toBe(true);
    expect(regularExpressionMatching('mississippi', 'mis*is*.p*.')).toBe(true);
    expect(regularExpressionMatching('ab', '.*')).toBe(true);

    expect(regularExpressionMatching('', 'a')).toBe(false);
    expect(regularExpressionMatching('a', '')).toBe(false);
    expect(regularExpressionMatching('aab', 'aa')).toBe(false);
    expect(regularExpressionMatching('aab', 'baa')).toBe(false);
    expect(regularExpressionMatching('aabc', '...')).toBe(false);
    expect(regularExpressionMatching('aaabbdd', 'a*b*c*')).toBe(false);
    expect(regularExpressionMatching('mississippi', 'mis*is*p*.')).toBe(false);
    expect(regularExpressionMatching('ab', 'a*')).toBe(false);
    expect(regularExpressionMatching('abba', 'a*b*.c')).toBe(false);
    expect(regularExpressionMatching('abba', '.*c')).toBe(false);
  });

  describe('independent reference comparison', () => {
    /**
     * Independent recursive backtracking reference matcher for regex matching (. and *).
     * Operates without a dynamic programming matrix or calling regularExpressionMatching.
     *
     * @param {string} string
     * @param {string} pattern
     * @return {boolean}
     */
    function referenceRegexMatcher(string, pattern) {
      if (pattern.length === 0) {
        return string.length === 0;
      }

      const firstMatch = string.length > 0 && (pattern[0] === string[0] || pattern[0] === '.');

      if (pattern.length >= 2 && pattern[1] === '*') {
        return (
          referenceRegexMatcher(string, pattern.slice(2))
          || (firstMatch && referenceRegexMatcher(string.slice(1), pattern))
        );
      }

      return firstMatch && referenceRegexMatcher(string.slice(1), pattern.slice(1));
    }

    const referenceCases = [
      {
        string: '',
        pattern: '',
        expected: true,
        name: 'smallest valid input (both empty)',
      },
      {
        string: '',
        pattern: 'a*',
        expected: true,
        name: 'empty string with zero occurrence pattern',
      },
      {
        string: '',
        pattern: '.*',
        expected: true,
        name: 'empty string with wildcard star',
      },
      {
        string: '',
        pattern: 'a*b*',
        expected: true,
        name: 'empty string with multiple star sequences',
      },
      {
        string: '',
        pattern: 'a',
        expected: false,
        name: 'empty string with non-empty non-star pattern',
      },
      {
        string: '',
        pattern: '.',
        expected: false,
        name: 'empty string with dot pattern',
      },
      {
        string: 'a',
        pattern: '',
        expected: false,
        name: 'non-empty string with empty pattern',
      },
      {
        string: 'a',
        pattern: 'a',
        expected: true,
        name: 'single identical character',
      },
      {
        string: 'a',
        pattern: 'b',
        expected: false,
        name: 'single mismatched character',
      },
      {
        string: 'a',
        pattern: '.',
        expected: true,
        name: 'single character matched by dot',
      },
      {
        string: 'a',
        pattern: 'a*',
        expected: true,
        name: 'single character matched by star',
      },
      {
        string: 'a',
        pattern: '.*',
        expected: true,
        name: 'single character matched by dot star',
      },
      {
        string: 'a',
        pattern: 'b*a',
        expected: true,
        name: 'zero occurrences before matched character',
      },
      {
        string: 'aa',
        pattern: 'a',
        expected: false,
        name: 'length mismatch',
      },
      {
        string: 'aa',
        pattern: 'a*',
        expected: true,
        name: 'multiple occurrences matched by star',
      },
      {
        string: 'aa',
        pattern: '.*',
        expected: true,
        name: 'multiple occurrences matched by dot star',
      },
      {
        string: 'ab',
        pattern: '.*',
        expected: true,
        name: 'distinct characters matched by dot star',
      },
      {
        string: 'ab',
        pattern: 'a*',
        expected: false,
        name: 'unmatched trailing character',
      },
      {
        string: 'aab',
        pattern: 'aab',
        expected: true,
        name: 'exact multi-character match',
      },
      {
        string: 'aab',
        pattern: 'c*a*b',
        expected: true,
        name: 'representative ordinary input',
      },
      {
        string: 'aab',
        pattern: 'c*a*b*',
        expected: true,
        name: 'multiple stars with trailing optional',
      },
      {
        string: 'aab',
        pattern: 'baa',
        expected: false,
        name: 'reordered characters mismatch',
      },
      {
        string: 'mississippi',
        pattern: 'mis*is*p*.',
        expected: false,
        name: 'complex mismatch',
      },
      {
        string: 'mississippi',
        pattern: 'mis*is*.p*.',
        expected: true,
        name: 'complex match',
      },
    ];

    it('matches the smallest valid input (empty string and empty pattern)', () => {
      // Source precondition: regularExpressionMatching.js line 50
      // matchMatrix[0][0] = true initializes base empty-to-empty match.
      const string = '';
      const pattern = '';
      const expected = true;

      expect(regularExpressionMatching(string, pattern)).toBe(expected);
      expect(referenceRegexMatcher(string, pattern)).toBe(expected);
      expect(new RegExp(`^${pattern}$`).test(string)).toBe(expected);
    });

    it('matches the representative ordinary input (aab and c*a*b)', () => {
      // Source precondition: regularExpressionMatching.js lines 28-36, 60-68, 88-116
      // Evaluates zero occurrences of 'c', two of 'a', and one of 'b'.
      const string = 'aab';
      const pattern = 'c*a*b';
      const expected = true;

      expect(regularExpressionMatching(string, pattern)).toBe(expected);
      expect(referenceRegexMatcher(string, pattern)).toBe(expected);
      expect(new RegExp(`^${pattern}$`).test(string)).toBe(expected);
    });

    it('matches independent reference oracle and native RegExp across >= 20 valid inputs', () => {
      expect(referenceCases.length).toBeGreaterThanOrEqual(20);

      referenceCases.forEach(({
        string, pattern, expected,
      }) => {
        const actual = regularExpressionMatching(string, pattern);
        const oracleResult = referenceRegexMatcher(string, pattern);
        const nativeResult = new RegExp(`^${pattern}$`).test(string);

        expect(actual).toBe(expected);
        expect(oracleResult).toBe(expected);
        expect(nativeResult).toBe(expected);
      });
    });

    it('preserves argument non-mutation and purity', () => {
      const string = 'aab';
      const pattern = 'c*a*b';
      const stringBefore = string;
      const patternBefore = pattern;

      const firstCall = regularExpressionMatching(string, pattern);
      const secondCall = regularExpressionMatching(string, pattern);

      expect(firstCall).toBe(true);
      expect(secondCall).toBe(true);
      expect(string).toBe(stringBefore);
      expect(pattern).toBe(patternBefore);
    });
  });
});
