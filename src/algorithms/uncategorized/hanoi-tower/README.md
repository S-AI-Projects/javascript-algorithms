# Tower of Hanoi

The Tower of Hanoi (also called the Tower of Brahma or Lucas'
Tower and sometimes pluralized) is a mathematical game or puzzle. 
It consists of three rods and a number of disks of different sizes,
which can slide onto any rod. The puzzle starts with the disks in 
a neat stack in ascending order of size on one rod, the smallest 
at the top, thus making a conical shape.

The objective of the puzzle is to move the entire stack to another 
rod, obeying the following simple rules:

- Only one disk can be moved at a time.
- Each move consists of taking the upper disk from one of the 
stacks and placing it on top of another stack or on an empty rod.
- No disk may be placed on top of a smaller disk.

![Hanoi Tower](https://upload.wikimedia.org/wikipedia/commons/8/8d/Iterative_algorithm_solving_a_6_disks_Tower_of_Hanoi.gif)

Animation of an iterative algorithm solving 6-disk problem

With `3` disks, the puzzle can be solved in `7` moves. The minimal 
number of moves required to solve a Tower of Hanoi puzzle 
is `2^n − 1`, where `n` is the number of disks.

## Algorithm Invariants

The recursive solver `hanoiTowerRecursive` in [hanoiTower.js](./hanoiTower.js) preserves several fundamental invariants throughout execution:

1. **Move Count Invariant**: Exactly `2^n - 1` moves are performed to transfer `n` discs.
2. **Valid Placement Invariant**: At every step, a disc is only placed onto an empty pole or on top of a strictly larger disc (`disc < toPole.peek()`).
3. **Conservation of Discs**: The total multiset of discs across all three poles (`fromPole`, `withPole`, `toPole`) is strictly conserved at every step.
4. **Deterministic Transfer**: The top `n` discs from `fromPole` are transferred to `toPole` in the exact original relative order without altering any underlying discs.

## References

- [Wikipedia](https://en.wikipedia.org/wiki/Tower_of_Hanoi)
- [HackerEarth](https://www.hackerearth.com/blog/algorithms/tower-hanoi-recursion-game-algorithm-explained/)
