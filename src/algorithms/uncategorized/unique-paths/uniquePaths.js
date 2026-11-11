import pascalTriangle from '../../math/pascal-triangle/pascalTriangle';

/**
 * Contract:
 * - Preconditions:
 *   - width: Integer >= 1 (number of grid columns)
 *   - height: Integer >= 1 (number of grid rows)
 * - Postcondition:
 *   - Returns the exact number of unique paths from top-left (0, 0)
 *     to bottom-right (width - 1, height - 1) on a width x height grid,
 *     moving only right or down.
 * - Mutation & Side Effects:
 *   - Pure function; does not mutate inputs or any external state.
 *
 * @param {number} width - Positive integer representing grid width (>= 1).
 * @param {number} height - Positive integer representing grid height (>= 1).
 * @return {number} - Total number of unique paths.
 */
export default function uniquePaths(width, height) {
  const pascalLine = width + height - 2;
  const pascalLinePosition = Math.min(width, height) - 1;

  return pascalTriangle(pascalLine)[pascalLinePosition];
}
