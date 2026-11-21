/**
 * @typedef {import('../matrix/Matrix.js').Matrix} Matrix
 */

import * as mtrx from '../matrix/Matrix';

/**
 * Calculates the euclidean distance between 2 matrices.
 *
 * Contract & Preconditions:
 * - Line 29 (signature): accepts two matrices `a` and `b`.
 * - Line 30: mtrx.validateSameShape(a, b) validates that both matrices have
 *   matching dimensions and shapes.
 * - Line 32: let squaresTotal = 0 initializes the accumulator for sum of
 *   squared differences.
 * - Line 34-37 (Protected Condition): mtrx.walk traverses all matrix coordinates
 *   and accumulates squared differences:
 *   `squaresTotal += (aCellValue - bCellValue) ** 2;`.
 *   A plausible mutation omitting the square `** 2` or replacing accumulation
 *   `+=` with assignment `=` would violate the Euclidean distance metric.
 * - Line 39: returns Math.sqrt(squaresTotal) rounded to 2 decimal places.
 * - Pure function: does not mutate caller-owned matrix inputs.
 *
 * @param {Matrix} a
 * @param {Matrix} b
 * @returns {number}
 * @throws {Error}
 */
const euclideanDistance = (a, b) => {
  mtrx.validateSameShape(a, b);

  let squaresTotal = 0;

  mtrx.walk(a, (indices, aCellValue) => {
    const bCellValue = mtrx.getCellAtIndex(b, indices);
    squaresTotal += (aCellValue - bCellValue) ** 2;
  });

  return Number(Math.sqrt(squaresTotal).toFixed(2));
};

export default euclideanDistance;
