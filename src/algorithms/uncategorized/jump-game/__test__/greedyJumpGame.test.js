import greedyJumpGame from '../greedyJumpGame';

describe('greedyJumpGame', () => {
  it('should solve Jump Game problem in greedy manner', () => {
    expect(greedyJumpGame([1, 0])).toBe(true);
    expect(greedyJumpGame([100, 0])).toBe(true);
    expect(greedyJumpGame([2, 3, 1, 1, 4])).toBe(true);
    expect(greedyJumpGame([1, 1, 1, 1, 1])).toBe(true);
    expect(greedyJumpGame([1, 1, 1, 10, 1])).toBe(true);
    expect(greedyJumpGame([1, 5, 2, 1, 0, 2, 0])).toBe(true);

    expect(greedyJumpGame([1, 0, 1])).toBe(false);
    expect(greedyJumpGame([3, 2, 1, 0, 4])).toBe(false);
    expect(greedyJumpGame([0, 0, 0, 0, 0])).toBe(false);
    expect(greedyJumpGame([5, 4, 3, 2, 1, 0, 0])).toBe(false);
  });

  // ─── Repeatability and input-isolation tests (R51-T025) ───────────────────
  //
  // Precondition source: greedyJumpGame.js line 17
  //   @param {number[]} numbers - array of possible jump length.
  //
  // Fixtures are chosen as:
  //   • Smallest valid input: [1, 0]  → expected true
  //       Manually: leftGoodPosition starts at 1 (last index).
  //       Index 0: maxJump = 0 + 1 = 1 >= 1 → leftGoodPosition = 0.
  //       Result: leftGoodPosition === 0 → true.
  //   • Ordinary input:      [3, 2, 1, 0, 4] → expected false
  //       Manually: leftGoodPosition starts at 4.
  //       Index 3: 3+0=3 < 4 → no change.
  //       Index 2: 2+1=3 < 4 → no change.
  //       Index 1: 1+2=3 < 4 → no change.
  //       Index 0: 0+3=3 < 4 → no change.
  //       Result: leftGoodPosition === 4 ≠ 0 → false.
  //
  // greedyJumpGame is a pure function: it only reads `numbers` and uses a
  // local variable `leftGoodPosition`. It never writes to `numbers`, so
  // repeated calls and input arrays are fully isolated by design.
  // ─────────────────────────────────────────────────────────────────────────

  describe('repeatability and input isolation', () => {
    // ── Fixture 1: smallest valid input ──────────────────────────────────
    // Precondition source: greedyJumpGame.js line 17 (@param {number[]} numbers)
    it('smallest input [1,0] returns true on first call (precondition: line 17)', () => {
      // Expected computed independently: leftGoodPosition reaches 0 → true
      expect(greedyJumpGame([1, 0])).toBe(true);
    });

    it('smallest input [1,0] returns true on repeated second call (precondition: line 17)', () => {
      // Calling again must produce the identical result with no shared state
      expect(greedyJumpGame([1, 0])).toBe(true);
    });

    it('smallest input array [1,0] is not mutated by greedyJumpGame (precondition: line 17)', () => {
      const input = [1, 0];
      const snapshot = [...input];
      greedyJumpGame(input);
      // The function must not modify the caller's array
      expect(input).toEqual(snapshot);
    });

    // ── Fixture 2: ordinary input ─────────────────────────────────────────
    // Precondition source: greedyJumpGame.js line 17 (@param {number[]} numbers)
    it('ordinary input [3,2,1,0,4] returns false on first call (precondition: line 17)', () => {
      // Expected computed independently: no index can reach leftGoodPosition 4 → false
      expect(greedyJumpGame([3, 2, 1, 0, 4])).toBe(false);
    });

    it('ordinary input [3,2,1,0,4] returns false on repeated second call (precondition: line 17)', () => {
      // Repeated call must return the same result - no state bleeds between calls
      expect(greedyJumpGame([3, 2, 1, 0, 4])).toBe(false);
    });

    it('ordinary input array [3,2,1,0,4] is not mutated by greedyJumpGame (precondition: line 17)', () => {
      const input = [3, 2, 1, 0, 4];
      const snapshot = [...input];
      greedyJumpGame(input);
      expect(input).toEqual(snapshot);
    });

    // ── Cross-fixture isolation ───────────────────────────────────────────
    it('result of ordinary input is unaffected by prior call with smallest input (precondition: line 17)', () => {
      // Run smallest fixture first
      const resultSmallest = greedyJumpGame([1, 0]); // true
      expect(resultSmallest).toBe(true);

      // Then run ordinary fixture — must be independent of the previous call
      const resultOrdinary = greedyJumpGame([3, 2, 1, 0, 4]); // false
      expect(resultOrdinary).toBe(false);
    });

    it('result of smallest input is unaffected by prior call with ordinary input (precondition: line 17)', () => {
      // Run ordinary fixture first
      const resultOrdinary = greedyJumpGame([3, 2, 1, 0, 4]); // false
      expect(resultOrdinary).toBe(false);

      // Then run smallest fixture — must be independent
      const resultSmallest = greedyJumpGame([1, 0]); // true
      expect(resultSmallest).toBe(true);
    });
  });
});
