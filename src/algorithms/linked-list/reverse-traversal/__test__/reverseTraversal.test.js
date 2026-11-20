import LinkedList from '../../../../data-structures/linked-list/LinkedList';
import LinkedListNode from '../../../../data-structures/linked-list/LinkedListNode';
import reverseTraversal, { reverseTraversalRecursive } from '../reverseTraversal';

describe('reverseTraversal', () => {
  it('should traverse linked list in reverse order', () => {
    const linkedList = new LinkedList();

    linkedList
      .append(1)
      .append(2)
      .append(3);

    const traversedNodeValues = [];
    const traversalCallback = (nodeValue) => {
      traversedNodeValues.push(nodeValue);
    };

    reverseTraversal(linkedList, traversalCallback);

    expect(traversedNodeValues).toEqual([3, 2, 1]);
  });

  // ─── Contract regression tests for reverseTraversalRecursive (R51-T021) ───
  //
  // Source contract: reverseTraversal.js line 24 (reverseTraversalRecursive)
  // Contract invariants:
  //   1. Traversal order: Visits tail to head (reverse of node.next pointers).
  //   2. Return value: undefined (void function; side-effects via callback only).
  //   3. Non-mutating: Node values and node.next links are untouched.
  // ─────────────────────────────────────────────────────────────────────────

  describe('reverseTraversalRecursive contract and link preservation', () => {
    // ── Fixture 1: Three distinct nodes A -> B -> C ────────────────────────
    it('traverses A->B->C in reverse (C, B, A) and preserves node links (contract: line 24)', () => {
      const nodeC = new LinkedListNode('C', null);
      const nodeB = new LinkedListNode('B', nodeC);
      const nodeA = new LinkedListNode('A', nodeB);

      const visited = [];
      const result = reverseTraversalRecursive(nodeA, (val) => {
        visited.push(val);
      });

      // Assert return value contract (void / undefined)
      expect(result).toBeUndefined();

      // Assert traversal content: explicit expected values
      expect(visited).toEqual(['C', 'B', 'A']);

      // Assert node link integrity separately: verifies links were not broken or inverted
      expect(nodeA.next).toBe(nodeB);
      expect(nodeB.next).toBe(nodeC);
      expect(nodeC.next).toBeNull();

      // Assert node value integrity separately: verifies values were not mutated
      expect(nodeA.value).toBe('A');
      expect(nodeB.value).toBe('B');
      expect(nodeC.value).toBe('C');
    });

    // ── Fixture 2: Smallest supported list (null and single node) ───────────
    it('handles null node (empty list) with 0 callback invocations (contract: line 24)', () => {
      const visited = [];
      const result = reverseTraversalRecursive(null, (val) => visited.push(val));

      expect(result).toBeUndefined();
      expect(visited).toEqual([]);
    });

    it('handles single node list, preserving link and value (contract: line 24)', () => {
      const singleNode = new LinkedListNode('Solo', null);

      const visited = [];
      const result = reverseTraversalRecursive(singleNode, (val) => visited.push(val));

      expect(result).toBeUndefined();
      expect(visited).toEqual(['Solo']);

      // Link and value preserved
      expect(singleNode.next).toBeNull();
      expect(singleNode.value).toBe('Solo');
    });

    // ── Fixture 3: Repeated-value domain boundary (X -> X -> Y) ────────────
    it('handles repeated-value domain boundary X->X->Y preserving distinct links (contract: line 24)', () => {
      const node3 = new LinkedListNode('Y', null);
      const node2 = new LinkedListNode('X', node3);
      const node1 = new LinkedListNode('X', node2);

      const visited = [];
      const result = reverseTraversalRecursive(node1, (val) => visited.push(val));

      expect(result).toBeUndefined();
      expect(visited).toEqual(['Y', 'X', 'X']);

      // Verify node link identity (node1 points specifically to node2, not node3)
      expect(node1.next).toBe(node2);
      expect(node2.next).toBe(node3);
      expect(node3.next).toBeNull();

      // Verify node values
      expect(node1.value).toBe('X');
      expect(node2.value).toBe('X');
      expect(node3.value).toBe('Y');
    });
  });
});
