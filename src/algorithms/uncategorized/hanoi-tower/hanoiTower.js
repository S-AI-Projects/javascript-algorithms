import Stack from '../../../data-structures/stack/Stack';

/**
 * Solves the Tower of Hanoi puzzle recursively.
 *
 * Invariants & Preconditions:
 * - Preconditions:
 *   - numberOfDiscs: positive integer (n >= 1).
 *   - fromPole: Stack holding at least n discs in strictly ascending order from top to bottom.
 *   - withPole, toPole: Stack instances where any existing discs are strictly larger
 *     than the moving discs.
 *   - moveCallback: function invoked before each move with (disc, fromPoleArray, toPoleArray).
 * - Invariants maintained at each step:
 *   1. Move Count Invariant: Exactly (2^n - 1) moves are performed to transfer n discs.
 *   2. Valid Placement Invariant: A disc is never placed on top of a smaller disc.
 *   3. Conservation Invariant: The multiset of all discs across all three poles is strictly
 *      conserved.
 *   4. Deterministic Transfer Invariant: The top n discs from fromPole are transferred to toPole
 *      in identical order, while withPole returns to its initial state.
 *
 * Smallest Valid Input:
 *   numberOfDiscs = 1 -> Exactly 1 move (line 38 base case).
 *
 * Ordinary Input:
 *   numberOfDiscs = 3 -> Exactly 7 moves (2^3 - 1 = 7).
 *
 * @param {number} numberOfDiscs
 * @param {Stack} fromPole
 * @param {Stack} withPole
 * @param {Stack} toPole
 * @param {function(disc: number, fromPole: number[], toPole: number[])} moveCallback
 */
export function hanoiTowerRecursive({
  numberOfDiscs,
  fromPole,
  withPole,
  toPole,
  moveCallback,
}) {
  if (numberOfDiscs === 1) {
    // Base case with just one disc.
    moveCallback(fromPole.peek(), fromPole.toArray(), toPole.toArray());
    const disc = fromPole.pop();
    toPole.push(disc);
  } else {
    // In case if there are more discs then move them recursively.

    // Expose the bottom disc on fromPole stack.
    hanoiTowerRecursive({
      numberOfDiscs: numberOfDiscs - 1,
      fromPole,
      withPole: toPole,
      toPole: withPole,
      moveCallback,
    });

    // Move the disc that was exposed to its final destination.
    hanoiTowerRecursive({
      numberOfDiscs: 1,
      fromPole,
      withPole,
      toPole,
      moveCallback,
    });

    // Move temporary tower from auxiliary pole to its final destination.
    hanoiTowerRecursive({
      numberOfDiscs: numberOfDiscs - 1,
      fromPole: withPole,
      withPole: fromPole,
      toPole,
      moveCallback,
    });
  }
}

/**
 * @param {number} numberOfDiscs
 * @param {function(disc: number, fromPole: number[], toPole: number[])} moveCallback
 * @param {Stack} [fromPole]
 * @param {Stack} [withPole]
 * @param {Stack} [toPole]
 */
export default function hanoiTower({
  numberOfDiscs,
  moveCallback,
  fromPole = new Stack(),
  withPole = new Stack(),
  toPole = new Stack(),
}) {
  // Each of three poles of Tower of Hanoi puzzle is represented as a stack
  // that might contain elements (discs). Each disc is represented as a number.
  // Larger discs have bigger number equivalent.

  // Let's create the discs and put them to the fromPole.
  for (let discSize = numberOfDiscs; discSize > 0; discSize -= 1) {
    fromPole.push(discSize);
  }

  hanoiTowerRecursive({
    numberOfDiscs,
    fromPole,
    withPole,
    toPole,
    moveCallback,
  });
}
