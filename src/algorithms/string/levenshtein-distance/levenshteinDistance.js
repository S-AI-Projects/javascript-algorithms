/**
 * Calculate the Levenshtein (edit) distance between two strings with unit costs
 * (insertions, deletions, substitutions each cost 1).
 *
 * Domain and Boundary Contract:
 * - Public inputs:
 *     @param {string} a - first string sequence (length >= 0)
 *     @param {string} b - second string sequence (length >= 0)
 * - Result:
 *     @return {number} - non-negative integer representing minimum edits
 * - Mutation: Pure function; inputs are not mutated.
 * - External dependencies: None (uses standard Math.min).
 *
 * Input Partitioning & Boundary Table:
 * - Valid boundary:
 *     "", ""              -> 0 (smallest domain input, both lengths = 0)
 *     "a", ""             -> 1 (asymmetric empty boundary, deletion only)
 *     "", "a"             -> 1 (asymmetric empty boundary, insertion only)
 * - Valid interior:
 *     "cat", "cat"        -> 0 (identical non-empty strings, 0 edits)
 *     "kitten", "sitting" -> 3 (multi-character edit: sub+sub+ins)
 * - Unsupported / Out-of-contract:
 *     null or undefined   -> TypeError (unspecified by contract; native property read)
 *
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
export default function levenshteinDistance(a, b) {
  // Create empty edit distance matrix for all possible modifications of
  // substrings of a to substrings of b.
  const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  // Fill the first row of the matrix.
  // If this is first row then we're transforming empty string to a.
  // In this case the number of transformations equals to size of a substring.
  for (let i = 0; i <= a.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  // Fill the first column of the matrix.
  // If this is first column then we're transforming empty string to b.
  // In this case the number of transformations equals to size of b substring.
  for (let j = 0; j <= b.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, // deletion
        distanceMatrix[j - 1][i] + 1, // insertion
        distanceMatrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return distanceMatrix[b.length][a.length];
}
