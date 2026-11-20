// Tests for degreeToRadian.js
// Preconditions referenced from source line 5 (function signature) and line 6-10 (contract).

import degreeToRadian from '../degreeToRadian';

describe('degreeToRadian repeatability tests', () => {
  test('smallest valid input 0 returns 0 and is repeatable', () => {
    const expected = 0;
    const first = degreeToRadian(0);
    const second = degreeToRadian(0);
    expect(first).toBeCloseTo(expected);
    expect(second).toBeCloseTo(expected);
    // Ensure both calls give identical result
    expect(first).toBeCloseTo(second);
  });

  test('ordinary input 180 returns π and is repeatable across calls', () => {
    const expected = Math.PI;
    const first = degreeToRadian(180);
    const second = degreeToRadian(180);
    expect(first).toBeCloseTo(expected);
    expect(second).toBeCloseTo(expected);
    expect(first).toBeCloseTo(second);
  });

  test('different inputs do not affect each other', () => {
    const a = degreeToRadian(45);
    const b = degreeToRadian(90);
    const c = degreeToRadian(45);
    // a and c should be equal, b independent
    expect(a).toBeCloseTo(c);
    expect(b).toBeCloseTo(Math.PI / 2);
  });
});
