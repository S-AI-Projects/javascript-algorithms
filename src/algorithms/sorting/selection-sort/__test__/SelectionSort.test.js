import fs from 'fs';
import SelectionSort from '../SelectionSort';
import {
  equalArr,
  notSortedArr,
  reverseArr,
  sortedArr,
  SortTester,
} from '../../SortTester';

// Complexity constants.
const SORTED_ARRAY_VISITING_COUNT = 209;
const NOT_SORTED_ARRAY_VISITING_COUNT = 209;
const REVERSE_SORTED_ARRAY_VISITING_COUNT = 209;
const EQUAL_ARRAY_VISITING_COUNT = 209;

const selectionSortFixtures = [
  { name: 'mixed values', input: [3, 1, 2], expected: [1, 2, 3] },
  { name: 'duplicate values', input: [2, 2, 1], expected: [1, 2, 2] },
  { name: 'already ordered', input: [1, 2, 3], expected: [1, 2, 3] },
  { name: 'reversed', input: [3, 2, 1], expected: [1, 2, 3] },
  { name: 'empty collection', input: [], expected: [] },
  { name: 'single value', input: [1], expected: [1] },
];

const evidenceCases = [];

function assertSortedOutputPreservesInput(input, actual, expected) {
  expect(actual).toEqual(expected);
  expect(actual).toHaveLength(input.length);

  for (let index = 1; index < actual.length; index += 1) {
    expect(actual[index - 1]).toBeLessThanOrEqual(actual[index]);
  }

  const inputCounts = input.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
  const actualCounts = actual.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());

  expect(actualCounts).toEqual(inputCounts);
}

function runInvariantCase(name, input, expected) {
  const originalInput = [...input];
  const actual = new SelectionSort().sort(input);

  assertSortedOutputPreservesInput(input, actual, expected);
  expect(input).toEqual(originalInput);
  expect(actual).not.toBe(input);

  evidenceCases.push({
    name,
    input: originalInput,
    expected,
    actual,
  });
}

function createSeededGenerator(seed) {
  let state = seed;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

function createGeneratedCases(seed, count) {
  const nextRandom = createSeededGenerator(seed);

  return Array.from({ length: count }, (unused, index) => {
    const length = nextRandom() % 21;
    const input = Array.from({ length }, () => (nextRandom() % 201) - 100);

    return {
      name: `seed-${seed}-case-${index + 1}`,
      input,
      expected: [...input].sort((first, second) => first - second),
    };
  });
}

describe('SelectionSort', () => {
  it('should return ascending output without mutating the input for the fixtures', () => {
    selectionSortFixtures.forEach(({ name, input, expected }) => {
      runInvariantCase(name, input, expected);
    });
  });

  it('should preserve ordering and multiplicities for 100 seeded numeric arrays', () => {
    const seed = 0x51014;
    const generatedCases = createGeneratedCases(seed, 100);

    generatedCases.forEach(({ name, input, expected }) => {
      runInvariantCase(name, input, expected);
    });

    if (process.env.SELECTION_SORT_EVIDENCE_PATH) {
      fs.writeFileSync(
        process.env.SELECTION_SORT_EVIDENCE_PATH,
        JSON.stringify({
          seed,
          generatedCaseCount: generatedCases.length,
          fixtures: evidenceCases.slice(0, selectionSortFixtures.length),
          generatedCases: evidenceCases.slice(selectionSortFixtures.length),
        }, null, 2),
      );
    }
  });

  it('should sort array', () => {
    SortTester.testSort(SelectionSort);
  });

  it('should sort array with custom comparator', () => {
    SortTester.testSortWithCustomComparator(SelectionSort);
  });

  it('should sort negative numbers', () => {
    SortTester.testNegativeNumbersSort(SelectionSort);
  });

  it('should visit EQUAL array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      equalArr,
      EQUAL_ARRAY_VISITING_COUNT,
    );
  });

  it('should visit SORTED array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      sortedArr,
      SORTED_ARRAY_VISITING_COUNT,
    );
  });

  it('should visit NOT SORTED array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      notSortedArr,
      NOT_SORTED_ARRAY_VISITING_COUNT,
    );
  });

  it('should visit REVERSE SORTED array element specified number of times', () => {
    SortTester.testAlgorithmTimeComplexity(
      SelectionSort,
      reverseArr,
      REVERSE_SORTED_ARRAY_VISITING_COUNT,
    );
  });
});
