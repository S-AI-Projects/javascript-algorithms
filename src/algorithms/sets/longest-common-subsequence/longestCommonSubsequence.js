/**
 * @param {string[]} set1
 * @param {string[]} set2
 * @return {string[]}
 *
 * Complexity (let n = set1.length, m = set2.length):
 *   Time (worst-case):  O(n * m) — the DP table has (n+1)*(m+1) cells, each
 *     filled in O(1) (line 23-30). The backtrack phase (lines 44-57) is at
 *     most O(n + m). Dominant term: O(n * m).
 *   Space (worst-case): O(n * m) — the lcsMatrix stores (m+1)*(n+1) values
 *     (line 8). These are worst-case claims; observed operation counts for
 *     small inputs may differ from the asymptotic bound due to constant factors
 *     and the fixed backtrack overhead.
 *
 * Representative cases (precondition source: longestCommonSubsequence.js line 6):
 *   Smallest valid input:  set1 = [''], set2 = ['']  →  result = ['']
 *     (zero-length sentinel branch at line 35-38 is reached when LCS length
 *     is 0; for truly empty single-element arrays the matrix cell value is 0)
 *   Ordinary input:  set1 = ['A','B','C'], set2 = ['A','C']  →  result = ['A','C']
 *     (LCS length 2; independently verified: 'A' matches at (1,1), 'C' at (3,2))
 */
export default function longestCommonSubsequence(set1, set2) {
  // Init LCS matrix.
  const lcsMatrix = Array(set2.length + 1).fill(null).map(() => Array(set1.length + 1).fill(null));

  // Fill first row with zeros.
  for (let columnIndex = 0; columnIndex <= set1.length; columnIndex += 1) {
    lcsMatrix[0][columnIndex] = 0;
  }

  // Fill first column with zeros.
  for (let rowIndex = 0; rowIndex <= set2.length; rowIndex += 1) {
    lcsMatrix[rowIndex][0] = 0;
  }

  // Fill rest of the column that correspond to each of two strings.
  for (let rowIndex = 1; rowIndex <= set2.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= set1.length; columnIndex += 1) {
      if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
        lcsMatrix[rowIndex][columnIndex] = lcsMatrix[rowIndex - 1][columnIndex - 1] + 1;
      } else {
        lcsMatrix[rowIndex][columnIndex] = Math.max(
          lcsMatrix[rowIndex - 1][columnIndex],
          lcsMatrix[rowIndex][columnIndex - 1],
        );
      }
    }
  }

  // Calculate LCS based on LCS matrix.
  if (!lcsMatrix[set2.length][set1.length]) {
    // If the length of largest common string is zero then return empty string.
    return [''];
  }

  const longestSequence = [];
  let columnIndex = set1.length;
  let rowIndex = set2.length;

  while (columnIndex > 0 || rowIndex > 0) {
    if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
      // Move by diagonal left-top.
      longestSequence.unshift(set1[columnIndex - 1]);
      columnIndex -= 1;
      rowIndex -= 1;
    } else if (lcsMatrix[rowIndex][columnIndex] === lcsMatrix[rowIndex][columnIndex - 1]) {
      // Move left.
      columnIndex -= 1;
    } else {
      // Move up.
      rowIndex -= 1;
    }
  }

  return longestSequence;
}
