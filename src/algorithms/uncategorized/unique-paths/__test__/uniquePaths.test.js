import uniquePaths from '../uniquePaths';

describe('uniquePaths', () => {
  it('should find the number of unique paths for smallest valid input', () => {
    // 1x1 grid: already at destination
    expect(uniquePaths(1, 1)).toBe(1);
  });

  it('should find the number of unique paths for ordinary inputs', () => {
    // 3x2 grid: RRD, RDR, DRR
    expect(uniquePaths(3, 2)).toBe(3);
    expect(uniquePaths(2, 3)).toBe(3);
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
});

