/**
 * Calculates the Hamming distance between two strings of equal length.
 *
 * Supported Boundaries & Contract:
 * - Interior domain: Any two equal-length strings `a` and `b`.
 * - Valid boundary (length 0): `""` and `""` -> returns 0 (loop body does not execute).
 * - Valid boundary (length 1): Identical characters -> 0, differing characters -> 1.
 * - Stated fixture: "GAGCCT" vs "CATCGT" (length 6, 3 differing positions) -> returns 3.
 * - Identical string fixture: "GAGCCT" vs "GAGCCT" -> returns 0.
 * - Explicitly unsupported boundary: Unequal length strings (`a.length !== b.length`, line 19)
 *   throws `new Error('Strings must be of the same length')`.
 * - Mutation: Pure function, does not mutate inputs.
 *
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
export default function hammingDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error('Strings must be of the same length');
  }

  let distance = 0;

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      distance += 1;
    }
  }

  return distance;
}
