import levenshteinDistance from '../levenshteinDistance';

describe('levenshteinDistance', () => {
  it('should calculate edit distance between two strings', () => {
    expect(levenshteinDistance('', '')).toBe(0);
    expect(levenshteinDistance('a', '')).toBe(1);
    expect(levenshteinDistance('', 'a')).toBe(1);
    expect(levenshteinDistance('abc', '')).toBe(3);
    expect(levenshteinDistance('', 'abc')).toBe(3);

    // Should just add I to the beginning.
    expect(levenshteinDistance('islander', 'slander')).toBe(1);

    // Needs to substitute M by K, T by M and add an A to the end
    expect(levenshteinDistance('mart', 'karma')).toBe(3);

    // Substitute K by S, E by I and insert G at the end.
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);

    // Should add 4 letters FOOT at the beginning.
    expect(levenshteinDistance('ball', 'football')).toBe(4);

    // Should delete 4 letters FOOT at the beginning.
    expect(levenshteinDistance('football', 'foot')).toBe(4);

    // Needs to substitute the first 5 chars: INTEN by EXECU
    expect(levenshteinDistance('intention', 'execution')).toBe(5);
  });

  // ─── Domain boundary tests (R51-T022) ────────────────────────────────────
  //
  // Source contract: levenshteinDistance.js lines 26-30
  //   @param {string} a
  //   @param {string} b
  //   @return {number}
  //
  // Boundary Partitioning:
  //   1. Valid boundary:
  //      - Smallest supported domain: "" / "" (both empty, length 0) -> 0
  //      - Single empty string: "a" / "" -> 1 (deletion of 1 char)
  //      - Single empty string: "" / "a" -> 1 (insertion of 1 char)
  //   2. Valid interior:
  //      - Identical strings: "cat" / "cat" -> 0
  //      - Multi-operation edit: "kitten" / "sitting" -> 3 (k->s, e->i, +g)
  //   3. Unsupported / outside contract:
  //      - null / undefined violates @param {string}; attempting property
  //        access throws native TypeError without requiring artificial validation.
  // ─────────────────────────────────────────────────────────────────────────

  describe('domain boundaries and input partitioning', () => {
    // ── Valid boundary: smallest supported collection ("" / "") ──────────
    it('fixture "" / "" -> 0: smallest boundary with both empty strings (contract: lines 26-30)', () => {
      // Both strings have length 0; 0 edits required.
      const result = levenshteinDistance('', '');
      expect(result).toBe(0);
    });

    // ── Valid boundary: single-char against empty string ("a" / "") ───────
    it('fixture "a" / "" -> 1: asymmetric boundary with one empty string (contract: lines 26-30)', () => {
      // One string has length 1, other length 0; 1 deletion required.
      const result = levenshteinDistance('a', '');
      expect(result).toBe(1);
    });

    it('fixture "" / "a" -> 1: asymmetric boundary reversed (contract: lines 26-30)', () => {
      // One insertion required.
      const result = levenshteinDistance('', 'a');
      expect(result).toBe(1);
    });

    // ── Valid interior: identical strings ("cat" / "cat") ─────────────────
    it('fixture "cat" / "cat" -> 0: valid interior with identical non-empty strings (contract: lines 26-30)', () => {
      // Identical strings require 0 substitutions/insertions/deletions.
      const result = levenshteinDistance('cat', 'cat');
      expect(result).toBe(0);
    });

    // ── Valid interior: multi-char edit ("kitten" / "sitting") ───────────
    it('fixture "kitten" / "sitting" -> 3: valid interior multi-edit (contract: lines 26-30)', () => {
      // 3 operations: substitute 'k'->'s', substitute 'e'->'i', insert 'g'.
      const result = levenshteinDistance('kitten', 'sitting');
      expect(result).toBe(3);
    });

    // ── Outside documented boundary: unsupported non-string inputs ───────
    it('throws TypeError for null or undefined input outside documented string contract (lines 26-30)', () => {
      // Unspecified by contract; native property read triggers standard TypeError
      // without imposing an arbitrary custom error policy across the repository.
      expect(() => levenshteinDistance(null, '')).toThrow(TypeError);
      expect(() => levenshteinDistance('', undefined)).toThrow(TypeError);
    });
  });
});
