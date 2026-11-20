/**
 * Brute Force solution for Maximum Subarray problem.
 * Complexity: O(n^2) time, O(1) auxiliary space (O(k) for returned slice).
 *
 * Contract & Invariants:
 * - Preconditions:
 *   - Line 8: inputArray is an Array of numbers.
 *   - Line 13: startIndex iterates from 0 up to inputArray.length - 1.
 *   - Line 15: arrLength ranges from 1 up to inputArray.length - startIndex.
 *   - Line 17: strictly greater comparison (subarraySum > maxSubarraySum) breaks ties
 *     by keeping the earliest occurring subarray with maximum sum.
 *   - Line 25: returns a shallow copy via slice; inputArray is never mutated.
 * - Invariant 1 (Contiguity): The output is a contiguous subsegment of inputArray.
 * - Invariant 2 (Sum Maximality): For any contiguous subsegment S of inputArray,
 *   sum(S) <= sum(result).
 * - Invariant 3 (Immutability): inputArray elements, order, and length remain unchanged.
 * - Invariant 4 (Empty Boundary): When inputArray is [], returns [].
 *
 * @param {Number[]} inputArray
 * @return {Number[]}
 */
export default function bfMaximumSubarray(inputArray) {
  let maxSubarrayStartIndex = 0;
  let maxSubarrayLength = 0;
  let maxSubarraySum = null;

  for (let startIndex = 0; startIndex < inputArray.length; startIndex += 1) {
    let subarraySum = 0;
    for (let arrLength = 1; arrLength <= (inputArray.length - startIndex); arrLength += 1) {
      subarraySum += inputArray[startIndex + (arrLength - 1)];
      if (maxSubarraySum === null || subarraySum > maxSubarraySum) {
        maxSubarraySum = subarraySum;
        maxSubarrayStartIndex = startIndex;
        maxSubarrayLength = arrLength;
      }
    }
  }

  return inputArray.slice(maxSubarrayStartIndex, maxSubarrayStartIndex + maxSubarrayLength);
}
