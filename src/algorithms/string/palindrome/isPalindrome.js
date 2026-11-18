/**
 * Checks whether a given string is a palindrome using a two-pointer approach.
 *
 * Normalization note:
 * Normalization (such as lowercasing, whitespace stripping, or punctuation removal)
 * is NOT part of this function. Characters are compared directly and strictly at each
 * position (string[left] !== string[right]) without pre-processing.
 *
 * Decisive state transition:
 * Pointers left = 0 and right = string.length - 1 contract towards the center.
 * - Mismatch transition: if string[left] !== string[right], a mismatch is detected,
 *   which immediately terminates execution and returns false.
 * - Convergence transition: when left >= right, all symmetrical character pairs have
 *   matched, terminating the loop and returning true.
 *
 * Worked Examples:
 *
 * 1. Empty string (""):
 *    - Input: ""
 *    - Initial state: left = 0, right = -1
 *    - Condition left < right (0 < -1) is false.
 *    - Result: true
 *
 * 2. Single character ("a"):
 *    - Input: "a"
 *    - Initial state: left = 0, right = 0
 *    - Condition left < right (0 < 0) is false.
 *    - Result: true
 *
 * 3. Odd-length palindrome ("aba"):
 *    - Input: "aba"
 *    - Initial state: left = 0, right = 2
 *    - Step 1: string[0] ('a') === string[2] ('a') -> left = 1, right = 1
 *    - Loop ends: left < right (1 < 1) is false (pointers meet at middle character 'b').
 *    - Result: true
 *
 * 4. Non-palindrome ("ab"):
 *    - Input: "ab"
 *    - Initial state: left = 0, right = 1
 *    - Step 1: string[0] ('a') !== string[1] ('b') -> decisive mismatch exit.
 *    - Result: false
 *
 * 5. Even-length palindrome ("abba"):
 *    - Input: "abba"
 *    - Initial state: left = 0, right = 3
 *    - Step 1: string[0] ('a') === string[3] ('a') -> left = 1, right = 2
 *    - Step 2: string[1] ('b') === string[2] ('b') -> left = 2, right = 1
 *    - Loop ends: left < right (2 < 1) is false (pointers cross).
 *    - Result: true
 *
 * @param {string} string
 * @return {boolean}
 */
export default function isPalindrome(string) {
  let left = 0;
  let right = string.length - 1;

  while (left < right) {
    if (string[left] !== string[right]) {
      return false;
    }
    left += 1;
    right -= 1;
  }

  return true;
}
