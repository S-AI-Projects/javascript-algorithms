import degreeToRadian from '../degreeToRadian';

describe('degreeToRadian', () => {
  it('should convert degree to radian', () => {
    expect(degreeToRadian(0)).toBe(0);
    expect(degreeToRadian(45)).toBe(Math.PI / 4);
    expect(degreeToRadian(90)).toBe(Math.PI / 2);
    expect(degreeToRadian(180)).toBe(Math.PI);
    expect(degreeToRadian(270)).toBe((3 * Math.PI) / 2);
    expect(degreeToRadian(360)).toBe(2 * Math.PI);
  });
});

describe('degreeToRadian repeatability and input isolation', () => {
  // Preconditions referenced from source line 14 (function signature) and
  // line 15 (pure return degree * (Math.PI / 180)).
  // Observable dependencies: none (pure function).

  it('verifies smallest valid input 0 returns 0 repeatedly in isolated state and after another valid input', () => {
    // Precondition: degree is a finite number (degreeToRadian.js line 14).
    // Smallest valid input in non-negative degrees: 0
    // Independently calculated expected output: 0 * (Math.PI / 180) = 0
    const literalInput = 0;
    const expectedOutput = 0;

    // Run fixture twice in fresh isolated state
    const firstRun = degreeToRadian(literalInput);
    const secondRun = degreeToRadian(literalInput);
    expect(firstRun).toBe(expectedOutput);
    expect(secondRun).toBe(expectedOutput);
    expect(firstRun).toBe(secondRun);

    // Run after another valid input to verify earlier runs cannot alter later results
    const intermediate = degreeToRadian(90);
    expect(intermediate).toBeCloseTo(Math.PI / 2);

    const runAfterOther = degreeToRadian(literalInput);
    expect(runAfterOther).toBe(expectedOutput);
    expect(runAfterOther).toBe(firstRun);
  });

  it('verifies ordinary input 180 returns π repeatedly in isolated state and after another valid input', () => {
    // Precondition: degree is a finite number (degreeToRadian.js line 14).
    // Ordinary input: 180
    // Independently calculated expected output: 180 * (Math.PI / 180) = Math.PI = 3.141592653589793
    const literalInput = 180;
    const expectedOutput = Math.PI;

    // Run fixture twice in fresh isolated state
    const firstRun = degreeToRadian(literalInput);
    const secondRun = degreeToRadian(literalInput);
    expect(firstRun).toBe(expectedOutput);
    expect(secondRun).toBe(expectedOutput);
    expect(firstRun).toBe(secondRun);

    // Run after another valid input (e.g. 45 degrees)
    const intermediate = degreeToRadian(45);
    expect(intermediate).toBeCloseTo(Math.PI / 4);

    const runAfterOther = degreeToRadian(literalInput);
    expect(runAfterOther).toBe(expectedOutput);
    expect(runAfterOther).toBe(firstRun);
  });

  it('ensures input isolation and caller-owned state immutability', () => {
    // Verifies no shared mutable state exists and caller objects are preserved
    const callerState = { angle: 180, tag: 'caller-owned' };
    const callerStateCopy = JSON.parse(JSON.stringify(callerState));

    const result = degreeToRadian(callerState.angle);
    expect(result).toBe(Math.PI);
    expect(callerState).toEqual(callerStateCopy);

    const a = degreeToRadian(45);
    const b = degreeToRadian(90);
    const c = degreeToRadian(45);
    expect(a).toBeCloseTo(c);
    expect(b).toBeCloseTo(Math.PI / 2);
  });
});
