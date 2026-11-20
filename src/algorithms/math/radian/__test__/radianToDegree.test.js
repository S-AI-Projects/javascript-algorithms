// Tests for radianToDegree.js
// Preconditions referenced from source line 5 (function signature) and
// lines 6-11 (Contract & Preconditions block).

import radianToDegree from '../radianToDegree';

describe('radianToDegree', () => {
  it('should convert radian to degree', () => {
    expect(radianToDegree(0)).toBe(0);
    expect(radianToDegree(Math.PI / 4)).toBe(45);
    expect(radianToDegree(Math.PI / 2)).toBe(90);
    expect(radianToDegree(Math.PI)).toBe(180);
    expect(radianToDegree((3 * Math.PI) / 2)).toBe(270);
    expect(radianToDegree(2 * Math.PI)).toBe(360);
  });
});

describe('radianToDegree repeatability tests', () => {
  // Precondition: function is pure (source line 7-8), so identical inputs always
  // produce identical outputs regardless of call order.

  it('smallest valid input 0 returns 0 and is repeatable', () => {
    // Source line 5: function expects a finite number
    const expected = 0;
    const first = radianToDegree(0);
    const second = radianToDegree(0);
    expect(first).toBeCloseTo(expected);
    expect(second).toBeCloseTo(expected);
    // Both calls must yield identical results
    expect(first).toBeCloseTo(second);
  });

  it('ordinary input Math.PI returns 180 and is repeatable across calls', () => {
    // Source line 6: return value is radian * (180 / Math.PI)
    const expected = 180;
    const first = radianToDegree(Math.PI);
    const second = radianToDegree(Math.PI);
    expect(first).toBeCloseTo(expected);
    expect(second).toBeCloseTo(expected);
    expect(first).toBeCloseTo(second);
  });

  it('different inputs do not affect each other (input isolation)', () => {
    // Verifies no shared mutable state between calls
    const a = radianToDegree(Math.PI / 4); // 45
    const b = radianToDegree(Math.PI / 2); // 90
    const c = radianToDegree(Math.PI / 4); // 45 again
    expect(a).toBeCloseTo(c);
    expect(b).toBeCloseTo(90);
  });
});
