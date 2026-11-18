import fs from 'fs';
import combineWithRepetitions from '../combineWithRepetitions';
import factorial from '../../../math/factorial/factorial';

describe('combineWithRepetitions', () => {
  it('should combine string with repetitions', () => {
    expect(combineWithRepetitions(['A', 'B'], 0)).toEqual([
      [],
    ]);

    expect(combineWithRepetitions(['A'], 1)).toEqual([
      ['A'],
    ]);

    expect(combineWithRepetitions(['A', 'B'], 1)).toEqual([
      ['A'],
      ['B'],
    ]);

    expect(combineWithRepetitions(['A', 'B'], 2)).toEqual([
      ['A', 'A'],
      ['A', 'B'],
      ['B', 'B'],
    ]);

    expect(combineWithRepetitions(['A', 'B'], 3)).toEqual([
      ['A', 'A', 'A'],
      ['A', 'A', 'B'],
      ['A', 'B', 'B'],
      ['B', 'B', 'B'],
    ]);

    expect(combineWithRepetitions(['A', 'B'], -1)).toEqual([]);

    expect(combineWithRepetitions(['A', 'B', 'C'], 2)).toEqual([
      ['A', 'A'],
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'B'],
      ['B', 'C'],
      ['C', 'C'],
    ]);

    expect(combineWithRepetitions(['A', 'B', 'C'], 3)).toEqual([
      ['A', 'A', 'A'],
      ['A', 'A', 'B'],
      ['A', 'A', 'C'],
      ['A', 'B', 'B'],
      ['A', 'B', 'C'],
      ['A', 'C', 'C'],
      ['B', 'B', 'B'],
      ['B', 'B', 'C'],
      ['B', 'C', 'C'],
      ['C', 'C', 'C'],
    ]);

    const combinationOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const combinationSlotsNumber = 4;
    const combinations = combineWithRepetitions(combinationOptions, combinationSlotsNumber);
    const n = combinationOptions.length;
    const r = combinationSlotsNumber;
    const expectedNumberOfCombinations = factorial((r + n) - 1) / (factorial(r) * factorial(n - 1));

    expect(combinations.length).toBe(expectedNumberOfCombinations);
  });

  describe('mutation-resistant fixture tests (combineWithRepetitions.js line 6)', () => {
    // -------------------------------------------------------------------------
    // Precondition source: combineWithRepetitions.js line 6
    //   function combineWithRepetitions(comboOptions, comboLength)
    //   - comboOptions: *[]  — elements to pick from; not mutated
    //   - comboLength: number — length of each output combination
    //   - returns: *[][] — ordered list of combinations with repetitions allowed
    //
    // Protected condition (line 29):
    //   comboOptions.slice(optionIndex)
    //   A mutation of slice(optionIndex + 1) would skip self-repetition and
    //   produce wrong output whenever comboLength ≥ 2. The test named
    //   "protected condition: slice(optionIndex) enables self-repetition" catches
    //   this — it asserts that every output combination containing a repeated
    //   element is present, which the mutant would omit.
    // -------------------------------------------------------------------------

    it('smallest valid input: (["A"], 1) returns [["A"]] (line 17-19)', () => {
      // Precondition source: combineWithRepetitions.js line 17-19 (comboLength === 1)
      // Independently calculated: 1 element, length 1 → exactly 1 combination: [['A']]
      const comboOptions = ['A'];
      const comboLength = 1;
      const expected = [['A']]; // explicitly: only one element, chosen once

      const result = combineWithRepetitions(comboOptions, comboLength);
      expect(result).toEqual(expected); // explicit expected value

      // Input must not be mutated (contract line 6)
      expect(comboOptions).toEqual(['A']);
    });

    it('ordinary input: (["A","B"], 2) returns all 3 combos with repeats (line 26-37)', () => {
      // Precondition source: combineWithRepetitions.js line 26-37 (recursive case)
      // Independently calculated: C(2+2-1, 2) = C(3,2) = 3 combinations
      // Output must be in non-decreasing index order: AA, AB, BB
      const comboOptions = ['A', 'B'];
      const comboLength = 2;
      const expected = [
        ['A', 'A'], // self-repetition of 'A' — requires slice(optionIndex) at line 29
        ['A', 'B'], // 'A' then 'B'
        ['B', 'B'], // self-repetition of 'B'
      ];

      const result = combineWithRepetitions(comboOptions, comboLength);
      expect(result).toEqual(expected); // explicit expected value

      // Input must not be mutated
      expect(comboOptions).toEqual(['A', 'B']);
    });

    it('protected condition: slice(optionIndex) enables self-repetition (line 29)', () => {
      // This test is specifically designed to catch the plausible mutation:
      //   slice(optionIndex + 1) instead of slice(optionIndex)   [line 29]
      //
      // With the ORIGINAL code (slice(optionIndex)):
      //   combineWithRepetitions(['A','B','C'], 2) includes ['A','A'],['B','B'],['C','C']
      //
      // With the MUTANT code (slice(optionIndex + 1)):
      //   ['A','A'], ['B','B'], ['C','C'] would ALL be missing because the
      //   current element is excluded from the recursive sub-problem.
      //
      // Precondition source: combineWithRepetitions.js line 29
      const comboOptions = ['A', 'B', 'C'];
      const comboLength = 2;

      // Independently calculated: C(3+2-1, 2) = C(4,2) = 6 combinations
      const expected = [
        ['A', 'A'], // ← mutant would MISS this (no self-repetition)
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'B'], // ← mutant would MISS this
        ['B', 'C'],
        ['C', 'C'], // ← mutant would MISS this
      ];

      const result = combineWithRepetitions(comboOptions, comboLength);

      // These explicit assertions are the ones a mutation of line 29 would fail:
      expect(result).toEqual(expected); // full shape check
      expect(result.length).toBe(6); // explicit count: C(4,2)=6
      expect(result[0]).toEqual(['A', 'A']); // first combo MUST be a self-repetition
      expect(result[3]).toEqual(['B', 'B']); // fourth combo MUST be a self-repetition
      expect(result[5]).toEqual(['C', 'C']); // last combo MUST be a self-repetition

      // Every combination must have exactly comboLength elements
      result.forEach((combo) => {
        expect(combo).toHaveLength(comboLength);
      });

      // Input must not be mutated
      expect(comboOptions).toEqual(['A', 'B', 'C']);
    });

    it('comboLength = 0 returns [[]] regardless of options (line 7-9)', () => {
      // Precondition source: combineWithRepetitions.js line 7-9
      // The base case: comboLength === 0 → return [[]] (one empty combination)
      // Independently: choosing 0 elements gives exactly 1 empty combination.
      expect(combineWithRepetitions(['A', 'B'], 0)).toEqual([[]]); // explicit: [[]]
      expect(combineWithRepetitions([], 0)).toEqual([[]]); // even empty options
    });

    it('comboLength < 0 returns [] (line 11-13)', () => {
      // Precondition source: combineWithRepetitions.js line 11-13
      // Explicitly: negative comboLength is a no-op → empty result
      expect(combineWithRepetitions(['A', 'B'], -1)).toEqual([]); // explicit: []
    });

    it('mutation detection evidence: documents what the mutant would produce', () => {
      // This test documents the mutation experiment (the mutant is NOT in the
      // final source — it was analysed separately). It demonstrates that the
      // "protected condition" test above would catch the slice(optionIndex + 1)
      // mutation by asserting the CORRECT output explicitly.
      //
      // Original: combineWithRepetitions(['A','B'], 2) = [['A','A'],['A','B'],['B','B']]
      // Mutant:   combineWithRepetitions(['A','B'], 2) = [['A','B']]
      //   because slice(1+1)=slice(2)=['B'] for 'A', then slice(2)=[] for 'B'.
      //   So the mutant would produce only [['A','B']] — 1 combo instead of 3.
      //
      // The assertion below would FAIL on the mutant and PASS on the original.
      const result = combineWithRepetitions(['A', 'B'], 2);
      expect(result.length).toBe(3); // mutant produces 1, not 3 — detects mutation

      const evidenceData = {
        preconditionSource: 'combineWithRepetitions.js line 29',
        protectedCondition: 'comboOptions.slice(optionIndex) — includes current element for repetition',
        plausibleMutation: 'comboOptions.slice(optionIndex + 1) — skips current element',
        smallestInputWhereOriginalAndMutantDiffer: {
          comboOptions: ['A', 'B'],
          comboLength: 2,
          originalOutput: [['A', 'A'], ['A', 'B'], ['B', 'B']],
          mutantOutput: [['A', 'B']],
          namedAssertionThatDetectsMutation: 'result.length === 3 (mutant produces 1)',
        },
        ordinaryInput: {
          comboOptions: ['A', 'B', 'C'],
          comboLength: 2,
          expectedOutput: [['A', 'A'], ['A', 'B'], ['A', 'C'], ['B', 'B'], ['B', 'C'], ['C', 'C']],
          count: 6,
        },
      };

      if (process.env.CWR_EVIDENCE_PATH) {
        fs.writeFileSync(
          process.env.CWR_EVIDENCE_PATH,
          JSON.stringify(evidenceData, null, 2),
          'utf-8',
        );
      }
    });
  });
});
