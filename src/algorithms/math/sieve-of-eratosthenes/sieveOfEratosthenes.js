/**
 * Marks composite multiples of `prime` in the sieve array starting from `prime * prime`.
 *
 * Responsibility: Eliminate composite multiples of a detected prime.
 * Optimisation: Start marking multiples from `prime * prime`, as smaller multiples
 * will have already been marked by smaller prime factors.
 *
 * @param {boolean[]} isPrime
 * @param {number} prime
 * @param {number} maxNumber
 */
function markMultiples(isPrime, prime, maxNumber) {
  // eslint-disable-next-line no-param-reassign
  for (let nextNumber = prime * prime; nextNumber <= maxNumber; nextNumber += prime) {
    // eslint-disable-next-line no-param-reassign
    isPrime[nextNumber] = false;
  }
}

/**
 * Calculates all prime numbers up to maxNumber using the Sieve of Eratosthenes.
 *
 * Refactored to separate prime collection from composite marking (`markMultiples`).
 *
 * @param {number} maxNumber
 * @return {number[]}
 */
export default function sieveOfEratosthenes(maxNumber) {
  const isPrime = new Array(maxNumber + 1).fill(true);
  isPrime[0] = false;
  isPrime[1] = false;

  const primes = [];

  for (let number = 2; number <= maxNumber; number += 1) {
    if (isPrime[number] === true) {
      primes.push(number);
      markMultiples(isPrime, number, maxNumber);
    }
  }

  return primes;
}
