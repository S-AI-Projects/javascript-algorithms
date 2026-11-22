import euclideanDistance from '../euclideanDistance';

describe('euclideanDistance', () => {
  it('should calculate euclidean distance between vectors', () => {
    expect(euclideanDistance([[1]], [[2]])).toEqual(1);
    expect(euclideanDistance([[2]], [[1]])).toEqual(1);
    expect(euclideanDistance([[1, 2]], [[2, 1]])).toEqual(1.41);
    expect(euclideanDistance([[1, 2, 3]], [[2, 3, 4]])).toEqual(1.73);
  });

  it('should calculate euclidean distance between matrices', () => {
    const a = [
      [1, 2, 3],
      [4, 5, 6],
    ];

    const b = [
      [2, 3, 4],
      [5, 6, 7],
    ];

    expect(euclideanDistance(a, b)).toEqual(2.45);
  });

  it('should throw an error in case of matrices of different shapes', () => {
    expect(() => euclideanDistance([[1]], [[[2]]])).toThrow();
    expect(() => euclideanDistance([[1, 2]], [[2]])).toThrow();
    expect(() => euclideanDistance([[1, 2]], [[2, 3], [4, 5]])).toThrow();
  });
});

describe('euclideanDistance mutation-resistant regression tests', () => {
  // Preconditions & source line references in euclideanDistance.js:
  // - Line 29: function signature
  // - Line 30: mtrx.validateSameShape(a, b) precondition
  // - Line 32: squaresTotal initialization
  // - Line 36: protected accumulation `squaresTotal += (aCellValue - bCellValue) ** 2`
  // - Line 39: return Number(Math.sqrt(squaresTotal).toFixed(2))

  it('calculates smallest valid input with identical coordinates (distance 0)', () => {
    const a = [[0]];
    const b = [[0]];
    const expected = 0;
    expect(euclideanDistance(a, b)).toEqual(expected);
  });

  it('calculates smallest valid input with differing coordinates (distance 1)', () => {
    const a = [[1]];
    const b = [[2]];
    const expected = 1;
    expect(euclideanDistance(a, b)).toEqual(expected);
  });

  it('calculates ordinary 2D matrix input with independently calculated expected output', () => {
    // a = [[1, 2], [3, 4]], b = [[5, 6], [7, 8]]
    // (1-5)^2 + (2-6)^2 + (3-7)^2 + (4-8)^2 = 16 + 16 + 16 + 16 = 64
    // sqrt(64) = 8
    const a = [
      [1, 2],
      [3, 4],
    ];
    const b = [
      [5, 6],
      [7, 8],
    ];
    const expected = 8;
    expect(euclideanDistance(a, b)).toEqual(expected);
  });

  it('protected condition: square of difference is accumulated for each coordinate', () => {
    // On a = [[1, 2]], b = [[2, 1]]:
    // (1-2)^2 + (2-1)^2 = 1 + 1 = 2 -> sqrt(2) = 1.41
    // A mutant omitting square (a - b) would yield (-1) + (1) = 0 -> sqrt(0) = 0 != 1.41
    // A mutant assigning `=` instead of `+=` would yield only (2-1)^2 = 1 -> sqrt(1) = 1 != 1.41
    const a = [[1, 2]];
    const b = [[2, 1]];
    const expected = 1.41;
    expect(euclideanDistance(a, b)).toEqual(expected);
  });

  it('preserves input immutability and caller-owned state across executions', () => {
    const a = [[10, 20]];
    const b = [[30, 40]];
    const aCopy = JSON.stringify(a);
    const bCopy = JSON.stringify(b);

    const dist = euclideanDistance(a, b);
    expect(dist).toEqual(28.28);

    expect(JSON.stringify(a)).toEqual(aCopy);
    expect(JSON.stringify(b)).toEqual(bCopy);
  });
});
