/**
 * @param {*[]} comboOptions
 * @param {number} comboLength
 * @return {*[][]}
 *
 * Contract (precondition source: combineWithRepetitions.js line 6):
 *   - comboOptions: array of elements to pick from (repetitions allowed).
 *   - comboLength: non-negative integer length of each combination.
 *   - Returns: array of combinations (each is a sub-array of length comboLength).
 *   - comboOptions is NOT mutated.
 *   - Output ordering: lexicographic by input index (non-decreasing index sequences).
 *   - comboLength < 0  → returns [].
 *   - comboLength = 0  → returns [[]] (one empty combination).
 *   - comboLength = 1  → returns [[e] for each e in comboOptions].
 *
 * Protected condition (line 29):
 *   comboOptions.slice(optionIndex)  — slice starts AT the current element so
 *   the current element CAN be chosen again (repetition). A plausible mutation
 *   would be slice(optionIndex + 1), which would skip self-repetition and produce
 *   the wrong output for any comboLength ≥ 2. The regression test named
 *   "protected condition: slice(optionIndex) enables self-repetition" detects this.
 *
 * Representative cases:
 *   Smallest valid input:  combineWithRepetitions(['A'], 1)  →  [['A']]
 *     (line 17-19 base case; independently: 1 element, length 1 → 1 combo)
 *   Ordinary input:  combineWithRepetitions(['A','B'], 2)  →  [['A','A'],['A','B'],['B','B']]
 *     (line 26-37 recursive case; independently: C(2+2-1,2) = 3 combos with repeats)
 */
export default function combineWithRepetitions(comboOptions, comboLength) {
  if (comboLength === 0) {
    return [[]];
  }

  if (comboLength < 0) {
    return [];
  }

  // If the length of the combination is 1 then each element of the original array
  // is a combination itself.
  if (comboLength === 1) {
    return comboOptions.map((comboOption) => [comboOption]);
  }

  // Init combinations array.
  const combos = [];

  // Remember characters one by one and concatenate them to combinations of smaller lengths.
  // We don't extract elements here because the repetitions are allowed.
  comboOptions.forEach((currentOption, optionIndex) => {
    // Generate combinations of smaller size.
    const smallerCombos = combineWithRepetitions(
      comboOptions.slice(optionIndex),
      comboLength - 1,
    );

    // Concatenate currentOption with all combinations of smaller size.
    smallerCombos.forEach((smallerCombo) => {
      combos.push([currentOption].concat(smallerCombo));
    });
  });

  return combos;
}
