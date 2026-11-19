/**
 * Generates Cartesian Product of two sets.
 *
 * Contract:
 * - Preconditions:
 *   - Both `setA` and `setB` must be defined, non-null, and non-empty arrays (line 18).
 *     If either set is null or empty, returns `null` (line 19).
 * - Immutability: Inputs `setA` and `setB` are never mutated.
 * - Return Value: Array of pairs `[elementA, elementB]` representing all combinations.
 *
 * @param {*[]} setA
 * @param {*[]} setB
 * @return {*[]}
 */
export default function cartesianProduct(setA, setB) {
  // Check if input sets are not empty.
  // Otherwise return null since we can't generate Cartesian Product out of them.
  if (!setA || !setB || !setA.length || !setB.length) {
    return null;
  }

  // Init product set.
  const product = [];

  // Now, let's go through all elements of a first and second set and form all possible pairs.
  for (let indexA = 0; indexA < setA.length; indexA += 1) {
    for (let indexB = 0; indexB < setB.length; indexB += 1) {
      // Form the Cartesian pair between elements of setA and setB.
      const pair = [setA[indexA], setB[indexB]];
      product.push(pair);
    }
  }

  // Return cartesian product set.
  return product;
}
