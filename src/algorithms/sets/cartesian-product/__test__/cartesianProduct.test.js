import cartesianProduct from '../cartesianProduct';

describe('cartesianProduct', () => {
  it('should return null if there is not enough info for calculation', () => {
    const product1 = cartesianProduct([1], null);
    const product2 = cartesianProduct([], null);

    expect(product1).toBeNull();
    expect(product2).toBeNull();
  });

  it('should calculate the product of two sets', () => {
    const product1 = cartesianProduct([1], [1]);
    const product2 = cartesianProduct([1, 2], [3, 5]);

    expect(product1).toEqual([[1, 1]]);
    expect(product2).toEqual([[1, 3], [1, 5], [2, 3], [2, 5]]);
  });

  describe('focused refactoring and contract regression (R51-T006)', () => {
    it('smallest valid input: two singleton sets [1] and [2] (preconditions: lines 18-19)', () => {
      const setA = [1];
      const setB = [2];

      const setAClone = JSON.stringify(setA);
      const setBClone = JSON.stringify(setB);

      const result = cartesianProduct(setA, setB);
      expect(result).toEqual([[1, 2]]);

      // Input isolation check
      expect(JSON.stringify(setA)).toBe(setAClone);
      expect(JSON.stringify(setB)).toBe(setBClone);
    });

    it('ordinary input: two 2-element sets (preconditions: lines 18-19)', () => {
      const setA = ['x', 'y'];
      const setB = [1, 2];

      const expected = [
        ['x', 1],
        ['x', 2],
        ['y', 1],
        ['y', 2],
      ];

      expect(cartesianProduct(setA, setB)).toEqual(expected);
    });

    it('enforces precondition boundaries: empty or null sets return null', () => {
      expect(cartesianProduct([], [1])).toBeNull();
      expect(cartesianProduct([1], [])).toBeNull();
      expect(cartesianProduct(null, [1])).toBeNull();
      expect(cartesianProduct([1], null)).toBeNull();
    });
  });
});
