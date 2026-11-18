import fs from 'fs';
import linearSearch from '../linearSearch';

describe('linearSearch', () => {
  it('should search all numbers in array', () => {
    const array = [1, 2, 4, 6, 2];

    expect(linearSearch(array, 10)).toEqual([]);
    expect(linearSearch(array, 1)).toEqual([0]);
    expect(linearSearch(array, 2)).toEqual([1, 4]);
  });

  it('should search all strings in array', () => {
    const array = ['a', 'b', 'a'];

    expect(linearSearch(array, 'c')).toEqual([]);
    expect(linearSearch(array, 'b')).toEqual([1]);
    expect(linearSearch(array, 'a')).toEqual([0, 2]);
  });

  it('should search through objects as well', () => {
    const comparatorCallback = (a, b) => {
      if (a.key === b.key) {
        return 0;
      }

      return a.key <= b.key ? -1 : 1;
    };

    const array = [
      { key: 5 },
      { key: 6 },
      { key: 7 },
      { key: 6 },
    ];

    expect(linearSearch(array, { key: 10 }, comparatorCallback)).toEqual([]);
    expect(linearSearch(array, { key: 5 }, comparatorCallback)).toEqual([0]);
    expect(linearSearch(array, { key: 6 }, comparatorCallback)).toEqual([1, 3]);
  });

  it('should return matching indices for the focused numeric fixtures', () => {
    const cases = [
      {
        name: 'first element',
        input: [2, 4, 6, 8],
        seekElement: 2,
        expected: [0],
      },
      {
        name: 'last element',
        input: [2, 4, 6, 8],
        seekElement: 8,
        expected: [3],
      },
      {
        name: 'missing element',
        input: [2, 4, 6, 8],
        seekElement: 5,
        expected: [],
      },
      {
        name: 'singleton match',
        input: [7],
        seekElement: 7,
        expected: [0],
      },
      {
        name: 'singleton miss',
        input: [7],
        seekElement: 2,
        expected: [],
      },
      {
        name: 'empty collection',
        input: [],
        seekElement: 2,
        expected: [],
      },
      {
        name: 'duplicate values',
        input: [2, 4, 2],
        seekElement: 2,
        expected: [0, 2],
      },
    ];

    const evidence = cases.map(({
      name, input, seekElement, expected,
    }) => {
      const actual = linearSearch(input, seekElement);
      expect(actual).toEqual(expected);

      return {
        name,
        input,
        seekElement,
        expected,
        actual,
      };
    });

    if (process.env.LINEAR_SEARCH_EVIDENCE_PATH) {
      fs.writeFileSync(
        process.env.LINEAR_SEARCH_EVIDENCE_PATH,
        JSON.stringify(evidence, null, 2),
        'utf-8',
      );
    }
  });

  it('should preserve input and comparator call order', () => {
    const array = [2, 4, 6, 8];
    const comparatorCalls = [];
    const comparatorCallback = (element, seekElement) => {
      comparatorCalls.push({ element, seekElement });
      return element - seekElement;
    };

    expect(linearSearch(array, 6, comparatorCallback)).toEqual([2]);
    expect(comparatorCalls).toEqual([
      { element: 2, seekElement: 6 },
      { element: 4, seekElement: 6 },
      { element: 6, seekElement: 6 },
      { element: 8, seekElement: 6 },
    ]);
    expect(array).toEqual([2, 4, 6, 8]);
  });
});
