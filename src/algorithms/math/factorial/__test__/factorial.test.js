import factorial from '../factorial';

describe('factorial', () => {
  it('should calculate factorial', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(8)).toBe(40320);
    expect(factorial(10)).toBe(3628800);
  });
});

describe('factorial failure and empty-result coverage', () => {
  // Preconditions & branches in factorial.js:
  // - Line 19: export default function factorial(number)
  // - Line 20: initial accumulator `result = 1`
  // - Line 22: loop condition `i <= number` (starts at i = 2)
  // - Line 26: returns `result`

  it('handles empty-result / base case at number = 0 returning 1', () => {
    // factorial.js line 22: 2 <= 0 evaluates to false,
    // skipping the loop and returning 1 at line 26.
    const smallestInput = 0;
    const expected = 1;
    expect(factorial(smallestInput)).toBe(expected);
  });

  it('satisfies the required fixture: 0, 1, 2, and 5 expecting 1, 1, 2, and 120', () => {
    // Fixture: Use 0, 1, 2 and 5, expecting 1, 1, 2 and 120
    // when the documented domain includes zero.
    // 0: loop condition `2 <= 0` is false (line 22), returns accumulator 1 (line 26)
    expect(factorial(0)).toBe(1);
    // 1: loop condition `2 <= 1` is false (line 22), returns accumulator 1 (line 26)
    expect(factorial(1)).toBe(1);
    // 2: loop executes 1 iteration (i = 2): 1 * 2 = 2
    expect(factorial(2)).toBe(2);
    // 5: loop executes 4 iterations (i = 2..5): 1 * 2 * 3 * 4 * 5 = 120
    expect(factorial(5)).toBe(120);
  });

  it('preserves caller-owned state and ensures an ordinary call succeeds after', () => {
    // Step 3: verify caller-owned state remains valid afterwards;
    // include a successful call after the failure/empty-result case.
    const callerState = {
      tag: 'caller-owned-object',
      items: [10, 20, 30],
      nested: { counter: 42 },
    };
    const callerStateCopy = JSON.parse(JSON.stringify(callerState));

    // Execute empty-result / base case (factorial(0))
    const emptyResult = factorial(0);
    expect(emptyResult).toBe(1);

    // Verify caller-owned state was untouched and remains strictly valid
    expect(callerState).toEqual(callerStateCopy);

    // Subsequent ordinary valid call succeeds after empty-result call
    const subsequentResult = factorial(5);
    expect(subsequentResult).toBe(120);
    expect(callerState).toEqual(callerStateCopy);
  });
});
