import kNN from '../kNN';

describe('kNN', () => {
  it('should throw an error on invalid data', () => {
    expect(() => {
      kNN();
    }).toThrow('Either dataSet or labels or toClassify were not set');
  });

  it('should throw an error on invalid labels', () => {
    const noLabels = () => {
      kNN([[1, 1]]);
    };
    expect(noLabels).toThrow('Either dataSet or labels or toClassify were not set');
  });

  it('should throw an error on not giving classification vector', () => {
    const noClassification = () => {
      kNN([[1, 1]], [1]);
    };
    expect(noClassification).toThrow('Either dataSet or labels or toClassify were not set');
  });

  it('should throw an error on not giving classification vector', () => {
    const inconsistent = () => {
      kNN([[1, 1]], [1], [1]);
    };
    expect(inconsistent).toThrow('Matrices have different shapes');
  });

  it('should find the nearest neighbour', () => {
    let dataSet;
    let labels;
    let toClassify;
    let expectedClass;

    dataSet = [[1, 1], [2, 2]];
    labels = [1, 2];
    toClassify = [1, 1];
    expectedClass = 1;
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass);

    dataSet = [[1, 1], [6, 2], [3, 3], [4, 5], [9, 2], [2, 4], [8, 7]];
    labels = [1, 2, 1, 2, 1, 2, 1];
    toClassify = [1.25, 1.25];
    expectedClass = 1;
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass);

    dataSet = [[1, 1], [6, 2], [3, 3], [4, 5], [9, 2], [2, 4], [8, 7]];
    labels = [1, 2, 1, 2, 1, 2, 1];
    toClassify = [1.25, 1.25];
    expectedClass = 2;
    expect(kNN(dataSet, labels, toClassify, 5)).toBe(expectedClass);
  });

  it('should find the nearest neighbour with equal distances', () => {
    const dataSet = [[0, 0], [1, 1], [0, 2]];
    const labels = [1, 3, 3];
    const toClassify = [0, 1];
    const expectedClass = 3;
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass);
  });

  it('should find the nearest neighbour in 3D space', () => {
    const dataSet = [[0, 0, 0], [0, 1, 1], [0, 0, 2]];
    const labels = [1, 3, 3];
    const toClassify = [0, 0, 1];
    const expectedClass = 3;
    expect(kNN(dataSet, labels, toClassify)).toBe(expectedClass);
  });

  describe('property and invariant tests (R51-T004)', () => {
    it('smallest valid input: 1 point, 1 label, k=1 (preconditions: lines 28, 37)', () => {
      const dataSet = [[0, 0]];
      const labels = [1];
      const toClassify = [0, 0];

      const dataSetClone = JSON.stringify(dataSet);
      const labelsClone = JSON.stringify(labels);
      const toClassifyClone = JSON.stringify(toClassify);

      const result = kNN(dataSet, labels, toClassify, 1);
      expect(result).toBe(1);

      // Verify input immutability
      expect(JSON.stringify(dataSet)).toBe(dataSetClone);
      expect(JSON.stringify(labels)).toBe(labelsClone);
      expect(JSON.stringify(toClassify)).toBe(toClassifyClone);
    });

    it('ordinary input: 3 points with known 2-to-1 majority label (preconditions: lines 28, 37)', () => {
      const dataSet = [[1, 1], [2, 2], [10, 10]];
      const labels = [1, 1, 2];
      const toClassify = [1.5, 1.5];

      const result = kNN(dataSet, labels, toClassify, 3);
      expect(result).toBe(1);
    });

    it('invariant: homogeneous labels always classify as that label across 100 seeded cases', () => {
      // Deterministic PRNG with fixed seed
      let seed = 12345;
      function pseudoRandom() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      }

      for (let trial = 0; trial < 100; trial += 1) {
        const pointCount = 3 + Math.floor(pseudoRandom() * 5); // 3 to 7 points
        const chosenLabel = 1 + Math.floor(pseudoRandom() * 5); // Label between 1 and 5
        const dataSet = [];
        const labels = [];

        for (let p = 0; p < pointCount; p += 1) {
          const x = Number((pseudoRandom() * 20 - 10).toFixed(2));
          const y = Number((pseudoRandom() * 20 - 10).toFixed(2));
          dataSet.push([x, y]);
          labels.push(chosenLabel);
        }

        const query = [
          Number((pseudoRandom() * 20 - 10).toFixed(2)),
          Number((pseudoRandom() * 20 - 10).toFixed(2)),
        ];

        const k = 1 + 2 * Math.floor(pseudoRandom() * Math.floor(pointCount / 2)); // Odd k
        const classified = kNN(dataSet, labels, query, k);

        // Invariant: must classify as chosenLabel because all data points have chosenLabel
        expect(classified).toBe(chosenLabel);
      }
    });
  });
});
