import LinkedList from '../../../../data-structures/linked-list/LinkedList';
import reverseTraversal from '../reverseTraversal';

describe('reverseTraversal', () => {
  it('should traverse linked list in reverse order without mutation', () => {
    const linkedList = new LinkedList();

    linkedList
      .append('A')
      .append('B')
      .append('C');

    const originalNodes = linkedList.toArray();
    const originalHead = linkedList.head;
    const originalTail = linkedList.tail;

    const traversedNodeValues = [];

    const traversalCallback = (nodeValue) => {
      traversedNodeValues.push(nodeValue);
    };

    const result = reverseTraversal(linkedList, traversalCallback);

    expect(traversedNodeValues).toEqual(['C', 'B', 'A']);
    expect(result).toBeUndefined();

    expect(linkedList.head).toBe(originalHead);
    expect(linkedList.tail).toBe(originalTail);

    expect(originalNodes[0].value).toBe('A');
    expect(originalNodes[0].next).toBe(originalNodes[1]);

    expect(originalNodes[1].value).toBe('B');
    expect(originalNodes[1].next).toBe(originalNodes[2]);

    expect(originalNodes[2].value).toBe('C');
    expect(originalNodes[2].next).toBeNull();
  });
  it('should handle an empty linked list', () => {
    const linkedList = new LinkedList();
    const traversedNodeValues = [];

    const result = reverseTraversal(linkedList, (nodeValue) => {
      traversedNodeValues.push(nodeValue);
    });

    expect(traversedNodeValues).toEqual([]);
    expect(result).toBeUndefined();
    expect(linkedList.head).toBeNull();
    expect(linkedList.tail).toBeNull();
  });
  it('should handle a linked list with one node', () => {
    const linkedList = new LinkedList();
    linkedList.append('A');

    const originalNode = linkedList.head;
    const traversedNodeValues = [];

    const result = reverseTraversal(linkedList, (nodeValue) => {
      traversedNodeValues.push(nodeValue);
    });

    expect(traversedNodeValues).toEqual(['A']);
    expect(result).toBeUndefined();

    expect(linkedList.head).toBe(originalNode);
    expect(linkedList.tail).toBe(originalNode);
    expect(originalNode.value).toBe('A');
    expect(originalNode.next).toBeNull();
  });
  it('should traverse nodes with repeated values correctly', () => {
    const linkedList = new LinkedList();

    linkedList
      .append('A')
      .append('B')
      .append('A');

    const originalNodes = linkedList.toArray();
    const traversedNodeValues = [];

    const result = reverseTraversal(linkedList, (nodeValue) => {
      traversedNodeValues.push(nodeValue);
    });

    expect(traversedNodeValues).toEqual(['A', 'B', 'A']);
    expect(result).toBeUndefined();

    // Verify that the actual node references remain unchanged.
    expect(linkedList.head).toBe(originalNodes[0]);
    expect(linkedList.tail).toBe(originalNodes[2]);

    expect(originalNodes[0].next).toBe(originalNodes[1]);
    expect(originalNodes[1].next).toBe(originalNodes[2]);
    expect(originalNodes[2].next).toBeNull();
  });
});

// it('should reverse traversal the linked list with callback', () => {
//   const linkedList = new LinkedList();
//
//   linkedList
//     .append(1)
//     .append(2)
//     .append(3);
//
//   expect(linkedList.toString()).toBe('1,2,3');
//   expect(linkedList.reverseTraversal(linkedList.head, value => value * 2)).toEqual([6, 4, 2]);
//   expect(() => linkedList.reverseTraversal(linkedList.head)).toThrow();
// });
