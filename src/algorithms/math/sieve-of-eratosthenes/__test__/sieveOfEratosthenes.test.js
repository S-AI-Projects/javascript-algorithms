import sieveOfEratosthenes from '../sieveOfEratosthenes';

describe('sieveOfEratosthenes', () => {
  it('should find all primes less than or equal to n', () => {
    expect(sieveOfEratosthenes(5)).toEqual([2, 3, 5]);
    expect(sieveOfEratosthenes(10)).toEqual([2, 3, 5, 7]);
    expect(sieveOfEratosthenes(100)).toEqual([
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41,
      43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
    ]);
  });
});

describe('sieveOfEratosthenes refactoring and fixture verification', () => {
  it('correctly handles boundary and fixture inputs around 1, 2, 9, 11, and 12', () => {
    // Domain around 1: non-prime boundary
    expect(sieveOfEratosthenes(1)).toEqual([]);
    // Domain around 2: smallest prime
    expect(sieveOfEratosthenes(2)).toEqual([2]);
    // Domain around 9: composite upper bound
    expect(sieveOfEratosthenes(9)).toEqual([2, 3, 5, 7]);
    // Domain around 11: prime upper bound
    expect(sieveOfEratosthenes(11)).toEqual([2, 3, 5, 7, 11]);
    // Sieve through 12: primes are 2, 3, 5, 7, 11
    expect(sieveOfEratosthenes(12)).toEqual([2, 3, 5, 7, 11]);
  });

  it('preserves caller state and public contract across repeated calls', () => {
    const callerState = { maxNumber: 12, tag: 'caller-owned' };
    const callerStateCopy = JSON.parse(JSON.stringify(callerState));

    const primes = sieveOfEratosthenes(callerState.maxNumber);
    expect(primes).toEqual([2, 3, 5, 7, 11]);
    expect(callerState).toEqual(callerStateCopy);
  });
});
