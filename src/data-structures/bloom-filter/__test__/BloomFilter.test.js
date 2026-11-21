import fs from 'fs';
import path from 'path';
import vm from 'vm';
import BloomFilter from '../BloomFilter';

describe('BloomFilter', () => {
  let bloomFilter;
  const people = [
    'Bruce Wayne',
    'Clark Kent',
    'Barry Allen',
  ];

  beforeEach(() => {
    bloomFilter = new BloomFilter();
  });

  it('should have methods named "insert" and "mayContain"', () => {
    expect(typeof bloomFilter.insert).toBe('function');
    expect(typeof bloomFilter.mayContain).toBe('function');
  });

  it('should create a new filter store with the appropriate methods', () => {
    const store = bloomFilter.createStore(18);
    expect(typeof store.getValue).toBe('function');
    expect(typeof store.setValue).toBe('function');
  });

  it('should hash deterministically with all 3 hash functions', () => {
    const str1 = 'apple';

    expect(bloomFilter.hash1(str1)).toEqual(bloomFilter.hash1(str1));
    expect(bloomFilter.hash2(str1)).toEqual(bloomFilter.hash2(str1));
    expect(bloomFilter.hash3(str1)).toEqual(bloomFilter.hash3(str1));

    expect(bloomFilter.hash1(str1)).toBe(14);
    expect(bloomFilter.hash2(str1)).toBe(43);
    expect(bloomFilter.hash3(str1)).toBe(10);

    const str2 = 'orange';

    expect(bloomFilter.hash1(str2)).toEqual(bloomFilter.hash1(str2));
    expect(bloomFilter.hash2(str2)).toEqual(bloomFilter.hash2(str2));
    expect(bloomFilter.hash3(str2)).toEqual(bloomFilter.hash3(str2));

    expect(bloomFilter.hash1(str2)).toBe(0);
    expect(bloomFilter.hash2(str2)).toBe(61);
    expect(bloomFilter.hash3(str2)).toBe(10);
  });

  it('should create an array with 3 hash values', () => {
    expect(bloomFilter.getHashValues('abc').length).toBe(3);
    expect(bloomFilter.getHashValues('abc')).toEqual([66, 63, 54]);
  });

  it('should handle the smallest positive filter size', () => {
    const smallestFilter = new BloomFilter(1);

    expect(smallestFilter.getHashValues('a')).toEqual([0, 0, 0]);

    smallestFilter.insert('a');

    expect(smallestFilter.mayContain('a')).toBe(true);
    expect(smallestFilter.mayContain('b')).toBe(true);
  });

  it('should produce the expected states for an ordinary input', () => {
    const ordinaryFilter = new BloomFilter();
    const insertedHashes = ordinaryFilter.getHashValues('apple');
    const queryHashes = ordinaryFilter.getHashValues('orange');

    expect(insertedHashes).toEqual([14, 43, 10]);
    expect(queryHashes).toEqual([0, 61, 10]);

    ordinaryFilter.insert('apple');

    expect(insertedHashes.map((index) => ordinaryFilter.storage.getValue(index)))
      .toEqual([true, true, true]);
    expect(queryHashes.map((index) => ordinaryFilter.storage.getValue(index)))
      .toEqual([false, false, true]);
    expect(ordinaryFilter.mayContain('apple')).toBe(true);
    expect(ordinaryFilter.mayContain('orange')).toBe(false);
  });

  it('should execute the documented example with its expected output', () => {
    const sourcePath = path.join(__dirname, '../BloomFilter.js');
    const source = fs.readFileSync(sourcePath, 'utf8');
    const doc = source.match(/\/\*\*([\s\S]*?@example[\s\S]*?)\*\//)[1];
    const exampleStart = doc.indexOf('@example');
    const outputStart = doc.indexOf('@example-output');
    const stripCommentPrefix = (line) => line.replace(/^\s*\*\s?/, '').trimEnd();
    const documentedOutput = doc
      .slice(outputStart + '@example-output'.length)
      .split('\n')
      .map(stripCommentPrefix)
      .filter(Boolean);
    const exampleCode = doc
      .slice(exampleStart + '@example'.length, outputStart)
      .split('\n')
      .map(stripCommentPrefix)
      .join('\n')
      .trim();
    const expectedOutput = [
      '[0,0,0]',
      'true',
      'true',
      '[14,43,10]',
      '[true,true,true]',
      '[0,61,10]',
      '[false,false,true]',
      'true',
      'false',
    ];
    const actualOutput = [];

    // Preconditions: BloomFilter.js:41-45 sets size and creates the store;
    // BloomFilter.js:89-91 initializes one false bit for size 1;
    // BloomFilter.js:51-56 sets bits and :62-73 checks all hash positions;
    // BloomFilter.js:160-165 computes three hash indexes per input.
    vm.runInNewContext(exampleCode, {
      BloomFilter,
      console: {
        log: (...values) => actualOutput.push(values.join(' ')),
      },
    });

    expect(documentedOutput).toEqual(expectedOutput);
    expect(actualOutput).toEqual(expectedOutput);
  });

  it('should insert strings correctly and return true when checking for inserted values', () => {
    people.forEach((person) => bloomFilter.insert(person));

    expect(bloomFilter.mayContain('Bruce Wayne')).toBe(true);
    expect(bloomFilter.mayContain('Clark Kent')).toBe(true);
    expect(bloomFilter.mayContain('Barry Allen')).toBe(true);

    expect(bloomFilter.mayContain('Tony Stark')).toBe(false);
  });
});
