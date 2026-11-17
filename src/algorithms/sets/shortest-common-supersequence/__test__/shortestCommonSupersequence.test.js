import shortestCommonSupersequence from '../shortestCommonSupersequence';

describe('shortestCommonSupersequence', () => {
  it('should find shortest common supersequence of two sequences', () => {
    // LCS (longest common subsequence) is empty
    expect(shortestCommonSupersequence(
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
    )).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);

    // LCS (longest common subsequence) is "EE"
    expect(shortestCommonSupersequence(
      ['G', 'E', 'E', 'K'],
      ['E', 'K', 'E'],
    )).toEqual(['G', 'E', 'K', 'E', 'K']);

    // LCS (longest common subsequence) is "GTAB"
    expect(shortestCommonSupersequence(
      ['A', 'G', 'G', 'T', 'A', 'B'],
      ['G', 'X', 'T', 'X', 'A', 'Y', 'B'],
    )).toEqual(['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B']);

    // LCS (longest common subsequence) is "BCBA".
    expect(shortestCommonSupersequence(
      ['A', 'B', 'C', 'B', 'D', 'A', 'B'],
      ['B', 'D', 'C', 'A', 'B', 'A'],
    )).toEqual(['A', 'B', 'D', 'C', 'A', 'B', 'D', 'A', 'B']);

    // LCS (longest common subsequence) is "BDABA".
    expect(shortestCommonSupersequence(
      ['B', 'D', 'C', 'A', 'B', 'A'],
      ['A', 'B', 'C', 'B', 'D', 'A', 'B', 'A', 'C'],
    )).toEqual(['A', 'B', 'C', 'B', 'D', 'C', 'A', 'B', 'A', 'C']);
  });

  describe('boundary and contract specifications', () => {
    // Preconditions established at:
    // shortestCommonSupersequence.js:20-22 (empty LCS / concatenation branch)
    // README.md:3-4 (definition of SCS on sequences)

    it('should handle smallest valid input ([] and [])', () => {
      // Source precondition: shortestCommonSupersequence.js lines 20-30 & README.md:3-4
      // Smallest valid input: [] and []
      // Independently calculated expected output: []
      expect(shortestCommonSupersequence([], [])).toEqual([]);
    });

    it('should handle boundary where one sequence is empty', () => {
      // Source precondition: shortestCommonSupersequence.js lines 29-31 & README.md:3-4
      // Boundary inputs: [] and ['A'], ['A'] and []
      // Independently calculated expected output: ['A']
      expect(shortestCommonSupersequence([], ['A'])).toEqual(['A']);
      expect(shortestCommonSupersequence(['A'], [])).toEqual(['A']);
    });

    it('should handle boundary single-element sequences (identical and disjoint)', () => {
      // Source precondition: shortestCommonSupersequence.js lines 20-84
      // Single-element identical: ['A'] and ['A'] -> ['A']
      // Single-element disjoint: ['A'] and ['B'] -> ['A', 'B']
      expect(shortestCommonSupersequence(['A'], ['A'])).toEqual(['A']);
      expect(shortestCommonSupersequence(['A'], ['B'])).toEqual(['A', 'B']);
    });

    it('should verify ordinary input from README.md (str1="AGGTAB", str2="GXTXAYB")', () => {
      // Source precondition: README.md lines 40-42, shortestCommonSupersequence.js line 23
      // Literal inputs from README.md:
      const set1 = ['A', 'G', 'G', 'T', 'A', 'B'];
      const set2 = ['G', 'X', 'T', 'X', 'A', 'Y', 'B'];
      // Independently calculated expected output: ['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B']
      const expected = ['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B'];

      expect(shortestCommonSupersequence(set1, set2)).toEqual(expected);
    });

    it('should verify ordinary input from README.md (str1="geek", str2="eke")', () => {
      // Source precondition: README.md lines 37-38, shortestCommonSupersequence.js line 23
      // Literal inputs from README.md:
      const set1 = ['G', 'E', 'E', 'K'];
      const set2 = ['E', 'K', 'E'];
      // Independently calculated expected output: ['G', 'E', 'K', 'E', 'K']
      const expected = ['G', 'E', 'K', 'E', 'K'];

      expect(shortestCommonSupersequence(set1, set2)).toEqual(expected);
    });

    it('does not mutate input arrays', () => {
      // Source precondition: shortestCommonSupersequence.js line 23
      const set1 = ['A', 'G', 'G', 'T', 'A', 'B'];
      const set2 = ['G', 'X', 'T', 'X', 'A', 'Y', 'B'];
      const set1Before = [...set1];
      const set2Before = [...set2];

      const result = shortestCommonSupersequence(set1, set2);

      expect(result).toEqual(['A', 'G', 'G', 'X', 'T', 'X', 'A', 'Y', 'B']);
      expect(set1).toEqual(set1Before);
      expect(set2).toEqual(set2Before);
    });
  });
});
