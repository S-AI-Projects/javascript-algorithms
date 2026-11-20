/**
 * @param {number} radian
 * @return {number}
 *
 * Contract & Preconditions:
 * - Input `radian` must be a finite number (see line 5: function signature).
 * - Function is pure: no external state is read or mutated.
 * - Returns the degree conversion of the provided radian value.
 * - No external dependencies.
 */
export default function radianToDegree(radian) {
  return radian * (180 / Math.PI);
}
