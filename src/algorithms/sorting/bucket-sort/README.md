# Bucket Sort

**Bucket sort**, or **bin sort**, is a sorting algorithm that works by distributing the elements of an array into a number of buckets. Each bucket is then sorted individually, either using a different sorting algorithm, or by recursively applying the bucket sorting algorithm.

## Algorithm

Bucket sort works as follows:

1. Set up an array of initially empty `buckets`.
2. **Scatter:** Go over the original array, putting each object in its `bucket`.
3. Sort each non-empty `bucket`.
4. **Gather:** Visit the `buckets` in order and put all elements back into the original array.

Elements are distributed among bins:

![Elements are distributed among bins](./images/bucket_sort_1.png)

Then, elements are sorted within each bin:

![Elements are sorted within each bin](./images/bucket_sort_2.png)

## Supported inputs and boundaries

`BucketSort` in [BucketSort.js](./BucketSort.js) sorts non-negative integer arrays
in ascending order and returns a new array without mutating the input. It accepts
an empty array and a single-element array; `bucketsNum` must be a positive
integer and defaults to `1`. Bucket contents are sorted by
[RadixSort](../radix-sort/RadixSort.js), which defines the integer-value limit.

| Input | Expected result |
| --- | --- |
| `[]` (smallest collection) | `[]` |
| `[7]` (smallest non-empty collection) | `[7]` |
| `[3, 1, 2]` | `[1, 2, 3]` |
| `[2, 2, 1]` | `[1, 2, 2]` |
| `[1, 2, 3]` | `[1, 2, 3]` |
| `[3, 2, 1]` | `[1, 2, 3]` |


## Complexity

The computational complexity depends on the algorithm used to sort each bucket, the number of buckets to use, and whether the input is uniformly distributed.

The **worst-case** time complexity of bucket sort is
`O(n^2)` if the sorting algorithm used on the bucket is *insertion sort*, which is the most common use case since the expectation is that buckets will not have too many elements relative to the entire list. In the worst case, all elements are placed in one bucket, causing the running time to reduce to the worst-case complexity of insertion sort (all elements are in reverse order). If the worst-case running time of the intermediate sort used is `O(n * log(n))`, then the worst-case running time of bucket sort will also be
`O(n * log(n))`.

On **average**, when the distribution of elements across buckets is reasonably uniform, it can be shown that bucket sort runs on average `O(n + k)` for `k` buckets.

## References

- [Bucket Sort on Wikipedia](https://en.wikipedia.org/wiki/Bucket_sort)
