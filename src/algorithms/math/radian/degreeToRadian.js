/**
 * @param {number} degree
 * @return {number}
 *
 * Contract & Preconditions:
 * - Line 14: Input `degree` must be a finite number (function signature).
 * - Line 15: Pure mathematical conversion `degree * (Math.PI / 180)`:
 *   no observable dependencies, external state, or globals are read or mutated.
 *   Observable dependencies: none (explicitly verified).
 * - Smallest valid input in non-negative angle domain: degree = 0 -> 0 radians.
 * - Ordinary valid input: degree = 180 -> Math.PI (3.141592653589793) radians.
 */
export default function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}
