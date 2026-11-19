import hammingDistance from '../hammingDistance';

describe('hammingDistance', () => {
  it('should throw an error when trying to compare the strings of different lengths', () => {
    const compareStringsOfDifferentLength = () => {
      hammingDistance('a', 'aa');
    };

    expect(compareStringsOfDifferentLength).toThrow();
  });

  it('should calculate difference between two strings', () => {
    expect(hammingDistance('a', 'a')).toBe(0);
    expect(hammingDistance('a', 'b')).toBe(1);
    expect(hammingDistance('abc', 'add')).toBe(2);
    expect(hammingDistance('karolin', 'kathrin')).toBe(3);
    expect(hammingDistance('karolin', 'kerstin')).toBe(3);
    expect(hammingDistance('1011101', '1001001')).toBe(2);
    expect(hammingDistance('2173896', '2233796')).toBe(3);
  });

  describe('supported boundaries (R51-T002)', () => {
    it('stated fixture: equal-length "GAGCCT" vs "CATCGT" with 3 differing positions', () => {
      expect(hammingDistance('GAGCCT', 'CATCGT')).toBe(3);
    });

    it('stated fixture: identical strings return 0 distance', () => {
      expect(hammingDistance('GAGCCT', 'GAGCCT')).toBe(0);
    });

    it('supported boundary: empty strings "" and "" return 0 distance', () => {
      expect(hammingDistance('', '')).toBe(0);
    });

    it('supported boundary: single-character strings identical vs differing', () => {
      expect(hammingDistance('x', 'x')).toBe(0);
      expect(hammingDistance('x', 'y')).toBe(1);
    });

    it('explicitly unsupported boundary: unequal lengths throw exact Error message (line 19)', () => {
      expect(() => hammingDistance('GAGCCT', 'GAGCCTA')).toThrow(
        'Strings must be of the same length',
      );
      expect(() => hammingDistance('', 'a')).toThrow(
        'Strings must be of the same length',
      );
    });
  });
});
