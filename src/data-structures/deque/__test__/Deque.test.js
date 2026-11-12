import { writeFileSync } from 'fs';
import Deque from '../Deque';

const referenceCases = [
  {
    name: 'empty deque (smallest valid input)',
    operations: [],
    expected: {
      removed: [],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'one value added at the back',
    operations: [['addBack', 1]],
    expected: {
      removed: [],
      values: [1],
      size: 1,
      isEmpty: false,
      front: 1,
      back: 1,
      string: '1',
    },
  },
  {
    name: 'one value added at the front',
    operations: [['addFront', 1]],
    expected: {
      removed: [],
      values: [1],
      size: 1,
      isEmpty: false,
      front: 1,
      back: 1,
      string: '1',
    },
  },
  {
    name: 'single back insertion and back removal',
    operations: [['addBack', 1], ['removeBack']],
    expected: {
      removed: [1],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'single front insertion and front removal',
    operations: [['addFront', 1], ['removeFront']],
    expected: {
      removed: [1],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'single back insertion and front removal',
    operations: [['addBack', 1], ['removeFront']],
    expected: {
      removed: [1],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'single front insertion and back removal',
    operations: [['addFront', 1], ['removeBack']],
    expected: {
      removed: [1],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'two values added at the back',
    operations: [['addBack', 1], ['addBack', 2]],
    expected: {
      removed: [],
      values: [1, 2],
      size: 2,
      isEmpty: false,
      front: 1,
      back: 2,
      string: '1,2',
    },
  },
  {
    name: 'two values added at the front',
    operations: [['addFront', 1], ['addFront', 2]],
    expected: {
      removed: [],
      values: [2, 1],
      size: 2,
      isEmpty: false,
      front: 2,
      back: 1,
      string: '2,1',
    },
  },
  {
    name: 'front then back insertion',
    operations: [['addFront', 1], ['addBack', 2]],
    expected: {
      removed: [],
      values: [1, 2],
      size: 2,
      isEmpty: false,
      front: 1,
      back: 2,
      string: '1,2',
    },
  },
  {
    name: 'back then front insertion',
    operations: [['addBack', 1], ['addFront', 2]],
    expected: {
      removed: [],
      values: [2, 1],
      size: 2,
      isEmpty: false,
      front: 2,
      back: 1,
      string: '2,1',
    },
  },
  {
    name: 'remove front from two back insertions',
    operations: [['addBack', 1], ['addBack', 2], ['removeFront']],
    expected: {
      removed: [1],
      values: [2],
      size: 1,
      isEmpty: false,
      front: 2,
      back: 2,
      string: '2',
    },
  },
  {
    name: 'remove back from two back insertions',
    operations: [['addBack', 1], ['addBack', 2], ['removeBack']],
    expected: {
      removed: [2],
      values: [1],
      size: 1,
      isEmpty: false,
      front: 1,
      back: 1,
      string: '1',
    },
  },
  {
    name: 'remove front from two front insertions',
    operations: [['addFront', 1], ['addFront', 2], ['removeFront']],
    expected: {
      removed: [2],
      values: [1],
      size: 1,
      isEmpty: false,
      front: 1,
      back: 1,
      string: '1',
    },
  },
  {
    name: 'remove back from two front insertions',
    operations: [['addFront', 1], ['addFront', 2], ['removeBack']],
    expected: {
      removed: [1],
      values: [2],
      size: 1,
      isEmpty: false,
      front: 2,
      back: 2,
      string: '2',
    },
  },
  {
    name: 'remove both ends of three back insertions',
    operations: [
      ['addBack', 1],
      ['addBack', 2],
      ['addBack', 3],
      ['removeFront'],
      ['removeBack'],
    ],
    expected: {
      removed: [1, 3],
      values: [2],
      size: 1,
      isEmpty: false,
      front: 2,
      back: 2,
      string: '2',
    },
  },
  {
    name: 'ordinary mixed-end sequence',
    operations: [
      ['addBack', 1],
      ['addBack', 2],
      ['addFront', 0],
      ['addBack', 3],
      ['removeBack'],
      ['removeFront'],
    ],
    expected: {
      removed: [3, 0],
      values: [1, 2],
      size: 2,
      isEmpty: false,
      front: 1,
      back: 2,
      string: '1,2',
    },
  },
  {
    name: 'remove from both ends of an empty deque',
    operations: [['removeFront'], ['removeBack']],
    expected: {
      removed: [null, null],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'remove to empty then remove from empty at the front',
    operations: [['addBack', 1], ['removeFront'], ['removeFront']],
    expected: {
      removed: [1, null],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'remove to empty then remove from empty at the back',
    operations: [['addBack', 1], ['removeBack'], ['removeBack']],
    expected: {
      removed: [1, null],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'falsy values retain order and identity',
    operations: [['addBack', 0], ['addBack', false], ['addBack', ''], ['removeFront']],
    expected: {
      removed: [0],
      values: [false, ''],
      size: 2,
      isEmpty: false,
      front: false,
      back: '',
      string: 'false,',
    },
  },
  {
    name: 'null remains a stored value',
    operations: [['addBack', null]],
    expected: {
      removed: [],
      values: [null],
      size: 1,
      isEmpty: false,
      front: null,
      back: null,
      string: 'null',
    },
  },
  {
    name: 'alternating operations return to the empty state',
    operations: [
      ['removeFront'],
      ['addFront', 4],
      ['removeBack'],
      ['addBack', 5],
      ['removeFront'],
    ],
    expected: {
      removed: [null, 4, 5],
      values: [],
      size: 0,
      isEmpty: true,
      front: null,
      back: null,
      string: '',
    },
  },
  {
    name: 'ordinary sequence leaves values at both ends',
    operations: [
      ['addFront', 2],
      ['addBack', 3],
      ['addFront', 1],
      ['addBack', 4],
      ['removeBack'],
      ['removeFront'],
    ],
    expected: {
      removed: [4, 1],
      values: [2, 3],
      size: 2,
      isEmpty: false,
      front: 2,
      back: 3,
      string: '2,3',
    },
  },
];

const sourceLines = {
  constructor: 'Deque.js:4-10 (zero-argument constructor initializes an empty list and length)',
  addFront: 'Deque.js:47-50',
  addBack: 'Deque.js:56-59',
  removeFront: 'Deque.js:65-72',
  removeBack: 'Deque.js:78-85',
  observation: 'Deque.js:17-18, 25-40, 91-102, 110-112',
  stringification: 'Deque.js:110-112 delegates to DoublyLinkedListNode.js:8-10',
};

function runDeque(operations) {
  const deque = new Deque();
  const removed = [];

  operations.forEach(([method, value]) => {
    if (method === 'addFront') {
      deque.addFront(value);
    } else if (method === 'addBack') {
      deque.addBack(value);
    } else if (method === 'removeFront') {
      removed.push(deque.removeFront());
    } else if (method === 'removeBack') {
      removed.push(deque.removeBack());
    }
  });

  return {
    removed,
    values: deque.toArray(),
    size: deque.size,
    isEmpty: deque.isEmpty(),
    front: deque.peekFront(),
    back: deque.peekBack(),
    string: deque.toString(),
  };
}

function runArrayReference(operations) {
  const values = [];
  const removed = [];

  operations.forEach(([method, value]) => {
    if (method === 'addFront') {
      values.unshift(value);
    } else if (method === 'addBack') {
      values.push(value);
    } else if (method === 'removeFront') {
      removed.push(values.length ? values.shift() : null);
    } else if (method === 'removeBack') {
      removed.push(values.length ? values.pop() : null);
    }
  });

  return {
    removed,
    values,
    size: values.length,
    isEmpty: values.length === 0,
    front: values.length ? values[0] : null,
    back: values.length ? values[values.length - 1] : null,
    string: values.map((value) => `${value}`).join(','),
  };
}

const comparisonResults = [];

afterAll(() => {
  if (process.env.DEQUE_EVIDENCE_FILE) {
    writeFileSync(
      process.env.DEQUE_EVIDENCE_FILE,
      `${JSON.stringify({
        sourceLines,
        comparisons: comparisonResults,
      }, null, 2)}\n`,
    );
  }
});

describe('Deque', () => {
  describe('independent array-reference comparisons', () => {
    referenceCases.forEach(({ name, operations, expected }) => {
      it(name, () => {
        const reference = runArrayReference(operations);
        const actual = runDeque(operations);

        comparisonResults.push({
          input: operations,
          expected,
          actual,
        });

        expect(reference).toEqual(expected);
        expect(actual).toEqual(expected);
        expect(actual).toEqual(reference);
      });
    });
  });

  it('returns a fresh array without mutating stored input values', () => {
    const value = Object.freeze({ nested: Object.freeze({ id: 1 }) });
    const deque = new Deque();

    deque.addBack(value);

    const firstArray = deque.toArray();
    const secondArray = deque.toArray();
    firstArray.push('outside');

    expect(firstArray).not.toBe(secondArray);
    expect(deque.toArray()).toEqual([value]);
    expect(deque.peekFront()).toBe(value);
    expect(deque.peekBack()).toBe(value);
    expect(value).toEqual({ nested: { id: 1 } });
  });

  it('should create an empty deque', () => {
    const deque = new Deque();

    expect(deque).not.toBeNull();
    expect(deque.isEmpty()).toBe(true);
    expect(deque.size).toBe(0);
  });

  it('should peek at the front and back of an empty deque', () => {
    const deque = new Deque();

    expect(deque.peekFront()).toBeNull();
    expect(deque.peekBack()).toBeNull();
  });

  it('should return null when removing from an empty deque', () => {
    const deque = new Deque();

    expect(deque.removeFront()).toBeNull();
    expect(deque.removeBack()).toBeNull();
  });

  it('should add elements to the back and remove from the front (queue behaviour)', () => {
    const deque = new Deque();

    deque.addBack(1);
    deque.addBack(2);
    deque.addBack(3);

    expect(deque.isEmpty()).toBe(false);
    expect(deque.size).toBe(3);
    expect(deque.peekFront()).toBe(1);
    expect(deque.peekBack()).toBe(3);

    expect(deque.removeFront()).toBe(1);
    expect(deque.removeFront()).toBe(2);
    expect(deque.removeFront()).toBe(3);
    expect(deque.removeFront()).toBeNull();
    expect(deque.isEmpty()).toBe(true);
  });

  it('should add elements to the front and remove from the back (reversed queue)', () => {
    const deque = new Deque();

    deque.addFront(1);
    deque.addFront(2);
    deque.addFront(3);

    expect(deque.size).toBe(3);
    expect(deque.peekFront()).toBe(3);
    expect(deque.peekBack()).toBe(1);

    expect(deque.removeBack()).toBe(1);
    expect(deque.removeBack()).toBe(2);
    expect(deque.removeBack()).toBe(3);
    expect(deque.removeBack()).toBeNull();
    expect(deque.isEmpty()).toBe(true);
  });

  it('should add elements to the front and remove from the front (stack behaviour)', () => {
    const deque = new Deque();

    deque.addFront('a');
    deque.addFront('b');
    deque.addFront('c');

    expect(deque.peekFront()).toBe('c');
    expect(deque.removeFront()).toBe('c');
    expect(deque.removeFront()).toBe('b');
    expect(deque.removeFront()).toBe('a');
    expect(deque.isEmpty()).toBe(true);
  });

  it('should support mixed addFront and addBack operations', () => {
    const deque = new Deque();

    // Build: [3, 1, 2, 4]
    deque.addBack(1);
    deque.addBack(2);
    deque.addFront(3);
    deque.addBack(4);

    expect(deque.size).toBe(4);
    expect(deque.peekFront()).toBe(3);
    expect(deque.peekBack()).toBe(4);
    expect(deque.toArray()).toEqual([3, 1, 2, 4]);
  });

  it('should support mixed removeFront and removeBack operations', () => {
    const deque = new Deque();

    deque.addBack(1);
    deque.addBack(2);
    deque.addBack(3);
    deque.addBack(4);

    expect(deque.removeFront()).toBe(1);
    expect(deque.removeBack()).toBe(4);
    expect(deque.removeFront()).toBe(2);
    expect(deque.removeBack()).toBe(3);
    expect(deque.isEmpty()).toBe(true);
  });

  it('should handle a single element correctly', () => {
    const deque = new Deque();

    deque.addBack(42);

    expect(deque.size).toBe(1);
    expect(deque.peekFront()).toBe(42);
    expect(deque.peekBack()).toBe(42);

    expect(deque.removeFront()).toBe(42);
    expect(deque.isEmpty()).toBe(true);
    expect(deque.peekFront()).toBeNull();
    expect(deque.peekBack()).toBeNull();
  });

  it('should handle object values', () => {
    const deque = new Deque();

    const obj1 = { key: 'value1' };
    const obj2 = { key: 'value2' };

    deque.addBack(obj1);
    deque.addFront(obj2);

    expect(deque.peekFront()).toEqual({ key: 'value2' });
    expect(deque.peekBack()).toEqual({ key: 'value1' });
    expect(deque.removeFront()).toEqual({ key: 'value2' });
    expect(deque.removeFront()).toEqual({ key: 'value1' });
  });

  it('should convert to array correctly', () => {
    const deque = new Deque();

    expect(deque.toArray()).toEqual([]);

    deque.addBack(1);
    deque.addBack(2);
    deque.addFront(0);

    expect(deque.toArray()).toEqual([0, 1, 2]);
  });

  it('should convert to string correctly', () => {
    const deque = new Deque();

    deque.addBack(1);
    deque.addBack(2);
    deque.addBack(3);

    expect(deque.toString()).toBe('1,2,3');
  });

  it('should convert to string with a custom callback', () => {
    const deque = new Deque();

    deque.addBack({ value: 1, key: 'test1' });
    deque.addBack({ value: 2, key: 'test2' });

    const toString = (value) => `${value.key}:${value.value}`;

    expect(deque.toString(toString)).toBe('test1:1,test2:2');
  });

  it('should track size correctly after many operations', () => {
    const deque = new Deque();

    expect(deque.size).toBe(0);

    deque.addBack(1);
    expect(deque.size).toBe(1);

    deque.addFront(0);
    expect(deque.size).toBe(2);

    deque.removeFront();
    expect(deque.size).toBe(1);

    deque.removeBack();
    expect(deque.size).toBe(0);

    deque.removeBack();
    expect(deque.size).toBe(0);
  });
});
