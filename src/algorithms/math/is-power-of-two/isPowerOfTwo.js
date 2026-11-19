/**
 * Checks whether given positive integer is a power of two.
 *
 * Contract & Protected Condition:
 * - Preconditions:
 *   - Input `number` is a numeric value (line 16).
 *   - Numbers less than 1 cannot be powers of two (lines 18-20).
 * - Protected Condition:
 *   - Boundary condition `number < 1` (line 18) ensures `1` (2^0) is supported and returns `true`.
 *     A plausible mistake changing `< 1` to `<= 1` would erroneously reject `1`.
 * - Return Value: `boolean` (true if number is power of two, false otherwise).
 *
 * @param {number} number
 * @return {boolean}
 */
export default function isPowerOfTwo(number) {
  // 1 (2^0) is the smallest power of two.
  if (number < 1) {
    return false;
  }

  // Let's find out if we can divide the number by two
  // many times without remainder.
  let dividedNumber = number;
  while (dividedNumber !== 1) {
    if (dividedNumber % 2 !== 0) {
      // For every case when remainder isn't zero we can say that this number
      // couldn't be a result of power of two.
      return false;
    }

    dividedNumber /= 2;
  }

  return true;
}
