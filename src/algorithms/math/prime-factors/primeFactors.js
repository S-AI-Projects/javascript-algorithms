/**
 * Extracts all occurrences of a candidate factor from a number and appends them to factors.
 *
 * @param {number} value - The number to extract factors from.
 * @param {number} factor - The factor candidate to divide out.
 * @param {number[]} factors - The array collecting prime factors.
 * @returns {number} - The remaining quotient after dividing out all instances of factor.
 */
function extractFactor(value, factor, factors) {
  let remainder = value;
  while (remainder % factor === 0) {
    remainder /= factor;
    factors.push(factor);
  }
  return remainder;
}

/**
 * Finds prime factors of a number.
 *
 * @param {number} n - the number that is going to be split into prime factors.
 * @returns {number[]} - array of prime factors.
 */
export function primeFactors(n) {
  // Clone n to avoid function arguments override and track the remaining number to factor.
  let remaining = n;

  // Array that stores all the prime factors.
  const factors = [];

  // Running the loop till sqrt(n) instead of n to optimise time complexity from O(n) to O(sqrt(n)).
  for (let factor = 2; factor <= Math.sqrt(remaining); factor += 1) {
    remaining = extractFactor(remaining, factor, factors);
  }

  // The ultimate remainder should be the last prime factor,
  // unless it is 1 (since 1 is not a prime number).
  if (remaining !== 1) {
    factors.push(remaining);
  }

  return factors;
}

/**
 * Hardy-Ramanujan approximation of prime factors count.
 *
 * @param {number} n
 * @returns {number} - approximate number of prime factors.
 */
export function hardyRamanujan(n) {
  return Math.log(Math.log(n));
}
