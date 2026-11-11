import uniquePaths from '../uniquePaths';

// Valid input preconditions are documented in uniquePaths.js:6-7.
const fixtures = [
  { width: 1, height: 1, expected: 1 }, // No moves are needed.
  { width: 3, height: 2, expected: 3 }, // Choose one down move among three moves.
  { width: 2, height: 3, expected: 3 }, // Choose one right move among three moves.
];

describe('uniquePaths', () => {
  it.each(fixtures)(
    'returns $expected for width $width and height $height',
    ({ width, height, expected }) => {
      expect(uniquePaths(width, height)).toBe(expected);
    },
  );

  it('should find the number of unique paths for additional ordinary inputs', () => {
    expect(uniquePaths(7, 3)).toBe(28);
    expect(uniquePaths(3, 7)).toBe(28);
  });

  it('should find the number of unique paths for repeated-value boundary cases (square grids)', () => {
    // Repeated dimensions width === height
    expect(uniquePaths(1, 1)).toBe(1);
    expect(uniquePaths(2, 2)).toBe(2);
    expect(uniquePaths(3, 3)).toBe(6);
    expect(uniquePaths(10, 10)).toBe(48620);
  });

  it('should find the number of unique paths for single-row and single-column boundary cases', () => {
    // Only one straight path possible along the single row or column
    expect(uniquePaths(1, 10)).toBe(1);
    expect(uniquePaths(10, 1)).toBe(1);
    expect(uniquePaths(1, 100)).toBe(1);
    expect(uniquePaths(100, 1)).toBe(1);
  });

  it('does not mutate inputs or retain state between calls', () => {
    // uniquePaths.js:6-7 establishes that these positive integer dimensions are valid.
    const width = 3;
    const height = 2;

    const firstResult = uniquePaths(width, height);
    const secondResult = uniquePaths(width, height);

    expect(firstResult).toBe(3);
    expect(secondResult).toBe(3);
    expect(width).toBe(3);
    expect(height).toBe(2);
  });
});
