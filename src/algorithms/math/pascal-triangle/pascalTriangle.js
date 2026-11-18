/**
 * Calculates the next binomial coefficient C(n, k) in Pascal's triangle
 * from the previous coefficient C(n, k - 1) using the recurrence relation:
 * C(n, k) = C(n, k - 1) * (n - k + 1) / k.
 *
 * @param {number} previousCoefficient - C(n, k - 1)
 * @param {number} lineNumber - n (zero-based row index)
 * @param {number} columnIndex - k (zero-based column index, where k >= 1)
 * @return {number} - C(n, k)
 */
function calculateNextCoefficient(previousCoefficient, lineNumber, columnIndex) {
  const binomialFactor = lineNumber - columnIndex + 1;
  return (previousCoefficient * binomialFactor) / columnIndex;
}

/**
 * @param {number} lineNumber - zero based.
 * @return {number[]}
 */
export default function pascalTriangle(lineNumber) {
  const currentLine = [1];

  const currentLineSize = lineNumber + 1;

  for (let numIndex = 1; numIndex < currentLineSize; numIndex += 1) {
    // See explanation of this formula in README.
    const previousCoefficient = currentLine[numIndex - 1];
    currentLine[numIndex] = calculateNextCoefficient(previousCoefficient, lineNumber, numIndex);
  }

  return currentLine;
}
