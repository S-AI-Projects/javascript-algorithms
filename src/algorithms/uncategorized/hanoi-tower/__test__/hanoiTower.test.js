import fs from 'fs';
import hanoiTower, { hanoiTowerRecursive } from '../hanoiTower';
import Stack from '../../../../data-structures/stack/Stack';

describe('hanoiTower', () => {
  it('should solve tower of hanoi puzzle with 2 discs', () => {
    const moveCallback = jest.fn();
    const numberOfDiscs = 2;

    const fromPole = new Stack();
    const withPole = new Stack();
    const toPole = new Stack();

    hanoiTower({
      numberOfDiscs,
      moveCallback,
      fromPole,
      withPole,
      toPole,
    });

    expect(moveCallback).toHaveBeenCalledTimes((2 ** numberOfDiscs) - 1);

    expect(fromPole.toArray()).toEqual([]);
    expect(toPole.toArray()).toEqual([1, 2]);

    expect(moveCallback.mock.calls[0][0]).toBe(1);
    expect(moveCallback.mock.calls[0][1]).toEqual([1, 2]);
    expect(moveCallback.mock.calls[0][2]).toEqual([]);

    expect(moveCallback.mock.calls[1][0]).toBe(2);
    expect(moveCallback.mock.calls[1][1]).toEqual([2]);
    expect(moveCallback.mock.calls[1][2]).toEqual([]);

    expect(moveCallback.mock.calls[2][0]).toBe(1);
    expect(moveCallback.mock.calls[2][1]).toEqual([1]);
    expect(moveCallback.mock.calls[2][2]).toEqual([2]);
  });

  it('should solve tower of hanoi puzzle with 3 discs', () => {
    const moveCallback = jest.fn();
    const numberOfDiscs = 3;

    hanoiTower({
      numberOfDiscs,
      moveCallback,
    });

    expect(moveCallback).toHaveBeenCalledTimes((2 ** numberOfDiscs) - 1);
  });

  it('should solve tower of hanoi puzzle with 6 discs', () => {
    const moveCallback = jest.fn();
    const numberOfDiscs = 6;

    hanoiTower({
      numberOfDiscs,
      moveCallback,
    });

    expect(moveCallback).toHaveBeenCalledTimes((2 ** numberOfDiscs) - 1);
  });

  describe('hanoiTowerRecursive invariant and property checks', () => {
    const evidenceCases = [];

    function runInvariantCheck(name, numberOfDiscs, discSizes) {
      const fromPole = new Stack();
      const withPole = new Stack();
      const toPole = new Stack();

      const discs = discSizes || Array.from({ length: numberOfDiscs }, (_, i) => i + 1);

      // Push discs onto fromPole in descending order so the smallest is at the top.
      for (let i = discs.length - 1; i >= 0; i -= 1) {
        fromPole.push(discs[i]);
      }

      const initialDiscs = [...discs];
      const initialDiscsSorted = [...discs].sort((a, b) => a - b);
      let moveCount = 0;
      const moveLog = [];

      const moveCallback = (disc, fromArray, toArray) => {
        moveCount += 1;

        // Invariant 1: Exactly the top disc of fromPole is moved.
        expect(disc).toBe(fromArray[0]);

        // Invariant 2: A disc cannot be placed on top of a smaller disc.
        if (toArray.length > 0) {
          expect(disc).toBeLessThan(toArray[0]);
        }

        moveLog.push({
          moveNumber: moveCount,
          disc,
          fromTop: fromArray[0],
          toTop: toArray.length > 0 ? toArray[0] : null,
        });
      };

      hanoiTowerRecursive({
        numberOfDiscs,
        fromPole,
        withPole,
        toPole,
        moveCallback,
      });

      const expectedMoves = (2 ** numberOfDiscs) - 1;

      // Invariant 3: Total number of moves is exactly 2^n - 1.
      expect(moveCount).toBe(expectedMoves);

      // Invariant 4: Conservation of discs and correct final placement.
      expect(fromPole.toArray()).toEqual([]);
      expect(withPole.toArray()).toEqual([]);
      expect(toPole.toArray()).toEqual(initialDiscsSorted);

      evidenceCases.push({
        name,
        numberOfDiscs,
        initialDiscs,
        expectedMoves,
        actualMoves: moveCount,
        finalToPole: toPole.toArray(),
      });
    }

    it('should satisfy invariants for the smallest valid input (numberOfDiscs = 1)', () => {
      // Source precondition: hanoiTower.js line 38 (base case)
      // Smallest valid input: numberOfDiscs = 1
      // Expected moves: 2^1 - 1 = 1
      runInvariantCheck('smallest valid input (n=1)', 1, [1]);
    });

    it('should satisfy invariants for ordinary input (numberOfDiscs = 3)', () => {
      // Source precondition: hanoiTower.js line 31
      // Ordinary input: numberOfDiscs = 3
      // Expected moves: 2^3 - 1 = 7
      runInvariantCheck('ordinary input (n=3)', 3, [1, 2, 3]);
    });

    it('should satisfy all invariants across 100 bounded valid generated test cases', () => {
      const seed = 0x51034;
      let state = seed;
      const nextRandom = () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state;
      };

      const generatedCases = Array.from({ length: 100 }, (_, index) => {
        // Discs bounded between 1 and 7 (move count 1 to 127) for fast execution.
        const numberOfDiscs = (nextRandom() % 7) + 1;

        // Generate strictly increasing disc sizes
        const startOffset = (nextRandom() % 10) + 1;
        const discSizes = [];
        let currentSize = startOffset;
        for (let i = 0; i < numberOfDiscs; i += 1) {
          discSizes.push(currentSize);
          currentSize += (nextRandom() % 5) + 1;
        }

        return {
          name: `generated-case-${index + 1}-n${numberOfDiscs}`,
          numberOfDiscs,
          discSizes,
        };
      });

      expect(generatedCases).toHaveLength(100);

      generatedCases.forEach(({ name, numberOfDiscs, discSizes }) => {
        runInvariantCheck(name, numberOfDiscs, discSizes);
      });

      if (process.env.HANOI_EVIDENCE_PATH) {
        fs.writeFileSync(
          process.env.HANOI_EVIDENCE_PATH,
          JSON.stringify(
            {
              seed,
              caseCount: generatedCases.length,
              cases: evidenceCases,
            },
            null,
            2,
          ),
          'utf-8',
        );
      }
    });
  });
});
