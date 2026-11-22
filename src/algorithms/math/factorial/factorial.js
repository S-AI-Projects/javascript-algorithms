/**
 * Calculates the factorial of a non-negative integer.
 *
 * Contract & Preconditions:
 * - Line 19 (function signature): accepts a non-negative integer `number`.
 * - Pure function: does not read or mutate external state,
 *   caller-owned objects, or global variables.
 * - Result: returns the factorial value (number).
 * - Total contract & empty-result path: For the smallest valid input in the
 *   documented non-negative integer domain, number = 0 (and also number = 1),
 *   the loop condition `2 <= number` (line 22) evaluates to false.
 *   The loop body is bypassed entirely and the initial accumulator `result = 1`
 *   (line 20) is returned directly at line 26 representing the mathematical
 *   empty product (0! = 1).
 *
 * @param {number} number
 * @return {number}
 */
export default function factorial(number) {
  let result = 1;

  for (let i = 2; i <= number; i += 1) {
    result *= i;
  }

  return result;
}
