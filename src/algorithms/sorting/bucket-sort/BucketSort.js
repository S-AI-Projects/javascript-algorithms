import RadixSort from '../radix-sort/RadixSort';

/**
 * Bucket Sort
 *
 * Sorts an array of non-negative integers in ascending order without mutating it.
 * Empty and single-element arrays are supported.
 *
 * @param {number[]} arr Array of non-negative integers.
 * @param {number} [bucketsNum=1] Positive integer number of buckets.
 * @return {number[]} A new array containing the sorted values.
 */
export default function BucketSort(arr, bucketsNum = 1) {
  const buckets = new Array(bucketsNum).fill(null).map(() => []);

  const minValue = Math.min(...arr);
  const maxValue = Math.max(...arr);

  const bucketSize = Math.ceil(Math.max(1, (maxValue - minValue) / bucketsNum));

  // Place elements into buckets.
  for (let i = 0; i < arr.length; i += 1) {
    const currValue = arr[i];
    const bucketIndex = Math.floor((currValue - minValue) / bucketSize);

    // Edge case for max value.
    if (bucketIndex === bucketsNum) {
      buckets[bucketsNum - 1].push(currValue);
    } else {
      buckets[bucketIndex].push(currValue);
    }
  }

  // Sort individual buckets.
  for (let i = 0; i < buckets.length; i += 1) {
    // Let's use the Radix Sorter here. This may give us
    // the average O(n + k) time complexity to sort one bucket
    // (where k is a number of digits in the longest number).
    buckets[i] = new RadixSort().sort(buckets[i]);
  }

  // Merge sorted buckets into final output.
  const sortedArr = [];
  for (let i = 0; i < buckets.length; i += 1) {
    sortedArr.push(...buckets[i]);
  }

  return sortedArr;
}
