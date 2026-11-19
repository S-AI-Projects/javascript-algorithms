import zAlgorithm, { buildZArray } from '../zAlgorithm';

describe('zAlgorithm', () => {
  it('should find word positions in given text', () => {
    expect(zAlgorithm('abcbcglx', 'abca')).toEqual([]);
    expect(zAlgorithm('abca', 'abca')).toEqual([0]);
    expect(zAlgorithm('abca', 'abcadfd')).toEqual([]);
    expect(zAlgorithm('abcbcglabcx', 'abc')).toEqual([0, 7]);
    expect(zAlgorithm('abcbcglx', 'bcgl')).toEqual([3]);
    expect(zAlgorithm('abcbcglx', 'cglx')).toEqual([4]);
    expect(zAlgorithm('abcxabcdabxabcdabcdabcy', 'abcdabcy')).toEqual([15]);
    expect(zAlgorithm('abcxabcdabxabcdabcdabcy', 'abcdabca')).toEqual([]);
    expect(zAlgorithm('abcxabcdabxaabcdabcabcdabcdabcy', 'abcdabca')).toEqual([12]);
    expect(zAlgorithm('abcxabcdabxaabaabaaaabcdabcdabcy', 'aabaabaaa')).toEqual([11]);
  });

  describe('buildZArray correctness fixtures and regression (R51-T009)', () => {
    it('smallest valid input: single character string (precondition: line 21)', () => {
      const result = buildZArray('a');
      expect(result).toEqual([0]);
    });

    it('ordinary input: "aab$aabx" (precondition: line 21)', () => {
      const result = buildZArray('aab$aabx');
      expect(result).toEqual([0, 1, 0, 0, 3, 1, 0, 0]);
    });

    it('representative fixture: "ab$xxabxx"', () => {
      const result = buildZArray('ab$xxabxx');
      expect(result).toEqual([0, 0, 0, 0, 0, 2, 0, 0, 0]);
    });
  });
});
