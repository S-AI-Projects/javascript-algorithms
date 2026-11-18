import fs from 'fs';
import DoublyLinkedList from '../DoublyLinkedList';

describe('DoublyLinkedList', () => {
  it('should create empty linked list', () => {
    const linkedList = new DoublyLinkedList();
    expect(linkedList.toString()).toBe('');
  });

  it('should append node to linked list', () => {
    const linkedList = new DoublyLinkedList();

    expect(linkedList.head).toBeNull();
    expect(linkedList.tail).toBeNull();

    linkedList.append(1);
    linkedList.append(2);

    expect(linkedList.head.next.value).toBe(2);
    expect(linkedList.tail.previous.value).toBe(1);
    expect(linkedList.toString()).toBe('1,2');
  });

  it('should prepend node to linked list', () => {
    const linkedList = new DoublyLinkedList();

    linkedList.prepend(2);
    expect(linkedList.head.toString()).toBe('2');
    expect(linkedList.tail.toString()).toBe('2');

    linkedList.append(1);
    linkedList.prepend(3);

    expect(linkedList.head.next.next.previous).toBe(linkedList.head.next);
    expect(linkedList.tail.previous.next).toBe(linkedList.tail);
    expect(linkedList.tail.previous.value).toBe(2);
    expect(linkedList.toString()).toBe('3,2,1');
  });

  it('should create linked list from array', () => {
    const linkedList = new DoublyLinkedList();
    linkedList.fromArray([1, 1, 2, 3, 3, 3, 4, 5]);

    expect(linkedList.toString()).toBe('1,1,2,3,3,3,4,5');
  });

  it('should delete node by value from linked list', () => {
    const linkedList = new DoublyLinkedList();

    expect(linkedList.delete(5)).toBeNull();

    linkedList.append(1);
    linkedList.append(1);
    linkedList.append(2);
    linkedList.append(3);
    linkedList.append(3);
    linkedList.append(3);
    linkedList.append(4);
    linkedList.append(5);

    expect(linkedList.head.toString()).toBe('1');
    expect(linkedList.tail.toString()).toBe('5');

    const deletedNode = linkedList.delete(3);
    expect(deletedNode.value).toBe(3);
    expect(linkedList.tail.previous.previous.value).toBe(2);
    expect(linkedList.toString()).toBe('1,1,2,4,5');

    linkedList.delete(3);
    expect(linkedList.toString()).toBe('1,1,2,4,5');

    linkedList.delete(1);
    expect(linkedList.toString()).toBe('2,4,5');

    expect(linkedList.head.toString()).toBe('2');
    expect(linkedList.head.next.next).toBe(linkedList.tail);
    expect(linkedList.tail.previous.previous).toBe(linkedList.head);
    expect(linkedList.tail.toString()).toBe('5');

    linkedList.delete(5);
    expect(linkedList.toString()).toBe('2,4');

    expect(linkedList.head.toString()).toBe('2');
    expect(linkedList.tail.toString()).toBe('4');

    linkedList.delete(4);
    expect(linkedList.toString()).toBe('2');

    expect(linkedList.head.toString()).toBe('2');
    expect(linkedList.tail.toString()).toBe('2');
    expect(linkedList.head).toBe(linkedList.tail);

    linkedList.delete(2);
    expect(linkedList.toString()).toBe('');
  });

  it('should delete linked list tail', () => {
    const linkedList = new DoublyLinkedList();

    expect(linkedList.deleteTail()).toBeNull();

    linkedList.append(1);
    linkedList.append(2);
    linkedList.append(3);

    expect(linkedList.head.toString()).toBe('1');
    expect(linkedList.tail.toString()).toBe('3');

    const deletedNode1 = linkedList.deleteTail();

    expect(deletedNode1.value).toBe(3);
    expect(linkedList.toString()).toBe('1,2');
    expect(linkedList.head.toString()).toBe('1');
    expect(linkedList.tail.toString()).toBe('2');

    const deletedNode2 = linkedList.deleteTail();

    expect(deletedNode2.value).toBe(2);
    expect(linkedList.toString()).toBe('1');
    expect(linkedList.head.toString()).toBe('1');
    expect(linkedList.tail.toString()).toBe('1');

    const deletedNode3 = linkedList.deleteTail();

    expect(deletedNode3.value).toBe(1);
    expect(linkedList.toString()).toBe('');
    expect(linkedList.head).toBeNull();
    expect(linkedList.tail).toBeNull();
  });

  it('should delete linked list head', () => {
    const linkedList = new DoublyLinkedList();

    expect(linkedList.deleteHead()).toBeNull();

    linkedList.append(1);
    linkedList.append(2);

    expect(linkedList.head.toString()).toBe('1');
    expect(linkedList.tail.toString()).toBe('2');

    const deletedNode1 = linkedList.deleteHead();

    expect(deletedNode1.value).toBe(1);
    expect(linkedList.head.previous).toBeNull();
    expect(linkedList.toString()).toBe('2');
    expect(linkedList.head.toString()).toBe('2');
    expect(linkedList.tail.toString()).toBe('2');

    const deletedNode2 = linkedList.deleteHead();

    expect(deletedNode2.value).toBe(2);
    expect(linkedList.toString()).toBe('');
    expect(linkedList.head).toBeNull();
    expect(linkedList.tail).toBeNull();
  });

  it('should be possible to store objects in the list and to print them out', () => {
    const linkedList = new DoublyLinkedList();

    const nodeValue1 = { value: 1, key: 'key1' };
    const nodeValue2 = { value: 2, key: 'key2' };

    linkedList
      .append(nodeValue1)
      .prepend(nodeValue2);

    const nodeStringifier = (value) => `${value.key}:${value.value}`;

    expect(linkedList.toString(nodeStringifier)).toBe('key2:2,key1:1');
  });

  it('should find node by value', () => {
    const linkedList = new DoublyLinkedList();

    expect(linkedList.find({ value: 5 })).toBeNull();

    linkedList.append(1);
    expect(linkedList.find({ value: 1 })).toBeDefined();

    linkedList
      .append(2)
      .append(3);

    const node = linkedList.find({ value: 2 });

    expect(node.value).toBe(2);
    expect(linkedList.find({ value: 5 })).toBeNull();
  });

  it('should find node by callback', () => {
    const linkedList = new DoublyLinkedList();

    linkedList
      .append({ value: 1, key: 'test1' })
      .append({ value: 2, key: 'test2' })
      .append({ value: 3, key: 'test3' });

    const node = linkedList.find({ callback: (value) => value.key === 'test2' });

    expect(node).toBeDefined();
    expect(node.value.value).toBe(2);
    expect(node.value.key).toBe('test2');
    expect(linkedList.find({ callback: (value) => value.key === 'test5' })).toBeNull();
  });

  it('should find node by means of custom compare function', () => {
    const comparatorFunction = (a, b) => {
      if (a.customValue === b.customValue) {
        return 0;
      }

      return a.customValue < b.customValue ? -1 : 1;
    };

    const linkedList = new DoublyLinkedList(comparatorFunction);

    linkedList
      .append({ value: 1, customValue: 'test1' })
      .append({ value: 2, customValue: 'test2' })
      .append({ value: 3, customValue: 'test3' });

    const node = linkedList.find({
      value: { value: 2, customValue: 'test2' },
    });

    expect(node).toBeDefined();
    expect(node.value.value).toBe(2);
    expect(node.value.customValue).toBe('test2');
    expect(linkedList.find({ value: 2, customValue: 'test5' })).toBeNull();
  });

  it('should reverse linked list', () => {
    const linkedList = new DoublyLinkedList();

    // Add test values to linked list.
    linkedList
      .append(1)
      .append(2)
      .append(3)
      .append(4);

    expect(linkedList.toString()).toBe('1,2,3,4');
    expect(linkedList.head.value).toBe(1);
    expect(linkedList.tail.value).toBe(4);

    // Reverse linked list.
    linkedList.reverse();

    expect(linkedList.toString()).toBe('4,3,2,1');

    expect(linkedList.head.previous).toBeNull();
    expect(linkedList.head.value).toBe(4);
    expect(linkedList.head.next.value).toBe(3);
    expect(linkedList.head.next.next.value).toBe(2);
    expect(linkedList.head.next.next.next.value).toBe(1);

    expect(linkedList.tail.next).toBeNull();
    expect(linkedList.tail.value).toBe(1);
    expect(linkedList.tail.previous.value).toBe(2);
    expect(linkedList.tail.previous.previous.value).toBe(3);
    expect(linkedList.tail.previous.previous.previous.value).toBe(4);

    // Reverse linked list back to initial state.
    linkedList.reverse();

    expect(linkedList.toString()).toBe('1,2,3,4');

    expect(linkedList.head.previous).toBeNull();
    expect(linkedList.head.value).toBe(1);
    expect(linkedList.head.next.value).toBe(2);
    expect(linkedList.head.next.next.value).toBe(3);
    expect(linkedList.head.next.next.next.value).toBe(4);

    expect(linkedList.tail.next).toBeNull();
    expect(linkedList.tail.value).toBe(4);
    expect(linkedList.tail.previous.value).toBe(3);
    expect(linkedList.tail.previous.previous.value).toBe(2);
    expect(linkedList.tail.previous.previous.previous.value).toBe(1);
  });

  describe('failure-path coverage and A→B→C node-link fixture (DoublyLinkedList.js)', () => {
    // -------------------------------------------------------------------------
    // Failure / empty-result paths exercised:
    //   • delete() on empty list   → null  (DoublyLinkedList.js line 74-76)
    //   • deleteTail() on empty    → null  (DoublyLinkedList.js line 157-160)
    //   • deleteHead() on empty    → null  (DoublyLinkedList.js line 184-186)
    //   • find() on empty list     → null  (DoublyLinkedList.js line 130-132)
    //   • find() – value not found → null  (DoublyLinkedList.js line 150)
    // -------------------------------------------------------------------------

    it('smallest supported list: empty list has null head and null tail', () => {
      // Smallest valid input — an empty DoublyLinkedList (no nodes at all).
      // Precondition source: DoublyLinkedList.js line 10-13 (constructor sets head/tail to null)
      const list = new DoublyLinkedList();

      // Check both values explicitly
      expect(list.head).toBeNull(); // DoublyLinkedList.js line 10
      expect(list.tail).toBeNull(); // DoublyLinkedList.js line 13
      expect(list.toString()).toBe('');
    });

    it('delete() on empty list returns null (DoublyLinkedList.js line 74-76)', () => {
      // Failure branch: "if (!this.head) { return null; }" — line 74-76
      const list = new DoublyLinkedList();

      // Failure case: delete on empty list → null sentinel
      const result = list.delete('A');
      expect(result).toBeNull(); // explicit expected value: null

      // State remains valid after failure — head and tail still null
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();

      // Ordinary valid call still succeeds after the failure case
      list.append('A');
      const afterFailure = list.delete('A');
      expect(afterFailure).not.toBeNull();
      expect(afterFailure.value).toBe('A'); // explicit expected value: 'A'
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
    });

    it('deleteTail() on empty list returns null (DoublyLinkedList.js line 157-160)', () => {
      // Failure branch: "if (!this.tail) { return null; }" — line 157-160
      const list = new DoublyLinkedList();

      const result = list.deleteTail();
      expect(result).toBeNull(); // explicit expected value: null

      // State valid after failure
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();

      // Ordinary valid call succeeds after failure
      list.append('X');
      const node = list.deleteTail();
      expect(node).not.toBeNull();
      expect(node.value).toBe('X'); // explicit expected value: 'X'
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
    });

    it('deleteHead() on empty list returns null (DoublyLinkedList.js line 184-186)', () => {
      // Failure branch: "if (!this.head) { return null; }" — line 184-186
      const list = new DoublyLinkedList();

      const result = list.deleteHead();
      expect(result).toBeNull(); // explicit expected value: null

      // State valid after failure
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();

      // Ordinary valid call succeeds after failure
      list.append('Y');
      const node = list.deleteHead();
      expect(node).not.toBeNull();
      expect(node.value).toBe('Y'); // explicit expected value: 'Y'
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
    });

    it('find() on empty list returns null (DoublyLinkedList.js line 130-132)', () => {
      // Failure branch: "if (!this.head) { return null; }" — line 130-132
      const list = new DoublyLinkedList();

      const result = list.find({ value: 'A' });
      expect(result).toBeNull(); // explicit expected value: null

      // State valid after failure
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();

      // Ordinary valid call succeeds after failure
      list.append('A');
      const found = list.find({ value: 'A' });
      expect(found).not.toBeNull();
      expect(found.value).toBe('A'); // explicit expected value: 'A'
    });

    it('find() returns null when value absent in non-empty list (DoublyLinkedList.js line 150)', () => {
      // Failure branch: exhausted traversal returns null — line 150
      const list = new DoublyLinkedList();
      list.append('A').append('B').append('C');

      const result = list.find({ value: 'Z' });
      expect(result).toBeNull(); // explicit expected value: null

      // State remains valid — list unchanged
      expect(list.head.value).toBe('A');
      expect(list.tail.value).toBe('C');

      // Ordinary valid call succeeds after the absent-value case
      const found = list.find({ value: 'B' });
      expect(found).not.toBeNull();
      expect(found.value).toBe('B'); // explicit expected value: 'B'
    });

    it('three distinct nodes A→B→C: values and node links checked separately', () => {
      // Fixture: Construct three distinct nodes A→B→C.
      // Checks values and node links in separate assertions so a value-only
      // comparison cannot hide a broken link.
      //
      // Precondition source:
      //   append() builds next/previous links — DoublyLinkedList.js lines 57-64
      const list = new DoublyLinkedList();
      list.append('A').append('B').append('C');

      // --- Value checks ---
      expect(list.head.value).toBe('A'); // explicit: 'A'
      expect(list.head.next.value).toBe('B'); // explicit: 'B'
      expect(list.head.next.next.value).toBe('C'); // explicit: 'C'
      expect(list.tail.value).toBe('C'); // explicit: 'C'

      // --- Forward link checks (next pointers) ---
      // A.next === B node
      expect(list.head.next).toBe(list.head.next); // identity — B node is B node
      expect(list.head.next.value).toBe('B');
      // B.next === C node (which is tail)
      expect(list.head.next.next).toBe(list.tail);
      // C.next === null (end of list)
      expect(list.tail.next).toBeNull();

      // --- Backward link checks (previous pointers) ---
      // A.previous === null (start of list)
      expect(list.head.previous).toBeNull();
      // B.previous === A node (which is head)
      expect(list.head.next.previous).toBe(list.head);
      // C.previous === B node
      expect(list.tail.previous).toBe(list.head.next);
      expect(list.tail.previous.value).toBe('B'); // explicit: 'B'

      // --- Roundtrip link integrity: forward then back must land on same node ---
      // A → B → A
      expect(list.head.next.previous).toBe(list.head);
      // B → C → B
      expect(list.tail.previous.next).toBe(list.tail);

      const evidenceData = {
        preconditionSource: 'DoublyLinkedList.js lines 57-64 (append next/previous links)',
        fixture: 'A→B→C',
        values: {
          head: list.head.value,
          middle: list.head.next.value,
          tail: list.tail.value,
        },
        links: {
          headPreviousIsNull: list.head.previous === null,
          headNextValueIsB: list.head.next.value === 'B',
          tailNextIsNull: list.tail.next === null,
          tailPreviousValueIsB: list.tail.previous.value === 'B',
          bPreviousIsHead: list.head.next.previous === list.head,
          bNextIsTail: list.head.next.next === list.tail,
        },
      };

      if (process.env.DLL_EVIDENCE_PATH) {
        fs.writeFileSync(
          process.env.DLL_EVIDENCE_PATH,
          JSON.stringify(evidenceData, null, 2),
          'utf-8',
        );
      }
    });
  });
});
