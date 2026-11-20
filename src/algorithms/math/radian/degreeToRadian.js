/**
 * @param {number} degree
 * @return {number}
 */
/**
 * Contract & Preconditions:
 * - Input `degree` must be a finite number.
 * - Function is pure: no external state is read or mutated.
 * - Returns the radian conversion of the provided degree.
 *   See source line 5 for implementation.
 */
export default function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}
