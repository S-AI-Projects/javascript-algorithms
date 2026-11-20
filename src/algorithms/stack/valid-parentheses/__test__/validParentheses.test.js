import Stack from '../../../../data-structures/stack/Stack';
import isValid from '../validParentheses';

describe('validParentheses', () => {
  it('should return false when string is empty', () => {
    expect(isValid('')).toBe(false);
  });

  it('should return true when string contains valid parentheses in correct order', () => {
    expect(isValid('()')).toBe(true);
    expect(isValid('()[]{}')).toBe(true);
    expect(isValid('((({[]})))')).toBe(true);
  });

  it('should return false when string contains invalid parentheses', () => {
    expect(isValid('(]')).toBe(false);
    expect(isValid('()[]{} }')).toBe(false);
    expect(isValid('((({[(]})))')).toBe(false);
  });

  it('should return false when string contains valid parentheses in wrong order', () => {
    expect(isValid('({)}')).toBe(false);
  });

  // ─── Stack LIFO fixture and Independent Oracle (R51-T023) ─────────────────
  //
  // Source contract: validParentheses.js line 29 (isValid)
  //
  // Stack fixture requirement:
  //   Push A, B and C; pop twice; push D; drain.
  //   The pop order is C, B, D, A.
  //   LIFO order and size agree after every operation.
  //   Exercise the documented empty-state behavior.
  //
  // Oracle:
  //   Independent reduction method (repeatedly reducing matching pairs ()/[]/{}
  //   without using a stack) comparing at least 20 inputs.
  // ─────────────────────────────────────────────────────────────────────────

  describe('Stack LIFO fixture and oracle comparison', () => {
    // Independent oracle implementation using string reduction
    function oracleIsValid(str) {
      if (!str || str.length === 0) return false;
      let prev;
      let s = str;
      do {
        prev = s;
        s = s.replace(/\(\)|\[\]|\{\}/g, '');
      } while (s.length < prev.length);
      return s.length === 0;
    }

    it('Stack fixture: push A,B,C; pop twice; push D; drain -> pop order is C,B,D,A', () => {
      // Re-use the Stack data structure used inside isValid
      const stack = new Stack();

      // Empty-state behavior before operations
      expect(stack.isEmpty()).toBe(true);
      expect(stack.peek()).toBeNull();
      expect(stack.pop()).toBeNull();

      const popped = [];

      // 1. Push A, B, C
      stack.push('A');
      expect(stack.isEmpty()).toBe(false);
      expect(stack.peek()).toBe('A');
      expect(stack.toArray()).toEqual(['A']);

      stack.push('B');
      expect(stack.peek()).toBe('B');
      expect(stack.toArray()).toEqual(['B', 'A']);

      stack.push('C');
      expect(stack.peek()).toBe('C');
      expect(stack.toArray()).toEqual(['C', 'B', 'A']);

      // 2. Pop twice
      popped.push(stack.pop()); // 'C'
      expect(stack.peek()).toBe('B');
      expect(stack.toArray()).toEqual(['B', 'A']);

      popped.push(stack.pop()); // 'B'
      expect(stack.peek()).toBe('A');
      expect(stack.toArray()).toEqual(['A']);

      // 3. Push D
      stack.push('D');
      expect(stack.peek()).toBe('D');
      expect(stack.toArray()).toEqual(['D', 'A']);

      // 4. Drain stack
      popped.push(stack.pop()); // 'D'
      expect(stack.peek()).toBe('A');
      expect(stack.toArray()).toEqual(['A']);

      popped.push(stack.pop()); // 'A'
      expect(stack.isEmpty()).toBe(true);
      expect(stack.peek()).toBeNull();
      expect(stack.toArray()).toEqual([]);

      // Explicit expected pop order: C, B, D, A
      expect(popped).toEqual(['C', 'B', 'D', 'A']);

      // Empty-state behavior after drain
      expect(stack.isEmpty()).toBe(true);
      expect(stack.pop()).toBeNull();
      expect(stack.peek()).toBeNull();
    });

    it('compares isValid against independent reduction oracle on 25+ inputs', () => {
      const testCases = [
        // Empty state (line 31 contract: returns false)
        { input: '', expected: false },

        // Basic pairs
        { input: '()', expected: true },
        { input: '[]', expected: true },
        { input: '{}', expected: true },

        // Combined sequence
        { input: '()[]{}', expected: true },
        { input: '{[()]}', expected: true },
        { input: '((({[]})))', expected: true },
        { input: '([]{})', expected: true },
        { input: '{()[]}', expected: true },
        { input: '((()))', expected: true },
        { input: '[[[]]]', expected: true },
        { input: '{{{}}}', expected: true },
        { input: '(())', expected: true },
        { input: '[[]]', expected: true },
        { input: '{{}}', expected: true },
        { input: '()()()', expected: true },
        { input: '[][][]', expected: true },
        { input: '{}{}{}', expected: true },
        { input: '([{}])', expected: true },
        { input: '{[()()]}', expected: true },
        { input: '({[]})', expected: true },

        // Invalid / mismatched cases
        { input: '((', expected: false },
        { input: ')', expected: false },
        { input: '(]', expected: false },
        { input: '({)}', expected: false },
        { input: '([)]', expected: false },
        { input: '{[(])}', expected: false },
        { input: '))((', expected: false },
        { input: '((({[(]})))', expected: false },
        { input: '()[]{} }', expected: false },
      ];

      testCases.forEach(({ input, expected }) => {
        const actual = isValid(input);
        const oracleResult = oracleIsValid(input);

        // Independent oracle must agree with expected value
        expect(oracleResult).toBe(expected);

        // Function under test must agree with explicit expected value
        expect(actual).toBe(expected);
      });
    });
  });
});
