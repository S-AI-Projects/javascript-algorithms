import {
  hillCipherEncrypt,
  hillCipherDecrypt,
  generateKeyMatrix,
} from '../hillCipher';

describe('hillCipher', () => {
  it('should throw an exception when trying to decipher', () => {
    expect(hillCipherDecrypt).toThrow('This method is not implemented yet');
  });

  it('should throw an error when message or keyString contains none letter character', () => {
    const invalidCharacterInMessage = () => {
      hillCipherEncrypt('hell3', 'helloworld');
    };
    const invalidCharacterInKeyString = () => {
      hillCipherEncrypt('hello', 'hel12world');
    };
    expect(invalidCharacterInMessage).toThrow(
      'The message and key string can only contain letters',
    );
    expect(invalidCharacterInKeyString).toThrow(
      'The message and key string can only contain letters',
    );
  });

  it('should throw an error when the length of the keyString has a square root which is not integer', () => {
    const invalidLengthOfKeyString = () => {
      hillCipherEncrypt('ab', 'ab');
    };
    expect(invalidLengthOfKeyString).toThrow(
      'Invalid key string length. The square root of the key string must be an integer',
    );
  });

  it('should throw an error when the length of the keyString does not equal to the power of length of the message', () => {
    const invalidLengthOfKeyString = () => {
      hillCipherEncrypt('ab', 'aaabbbccc');
    };
    expect(invalidLengthOfKeyString).toThrow(
      'Invalid key string length. The key length must be a square of message length',
    );
  });

  it('should encrypt passed message using Hill Cipher', () => {
    expect(hillCipherEncrypt('ACT', 'GYBNQKURP')).toBe('POH');
    expect(hillCipherEncrypt('CAT', 'GYBNQKURP')).toBe('FIN');
    expect(hillCipherEncrypt('GFG', 'HILLMAGIC')).toBe('SWK');
  });

  describe('generateKeyMatrix', () => {
    // Protected condition: generateKeyMatrix must correctly build a 1x1 key matrix
    // for single-character keys, computing dimensions [1, 1] and the cell value
    // ('A'.codePointAt(0) % 65 = 65 % 65 = 0) without applying multi-cell assumptions.
    // Fixture: 1x1 matrix and zero-containing matrix.
    it('generates a 1x1 key matrix for a single character key string', () => {
      const keyMatrix = generateKeyMatrix('A');
      expect(keyMatrix.length).toBe(1);
      expect(keyMatrix[0].length).toBe(1);
      expect(keyMatrix).toEqual([[0]]);
    });

    // Protected condition: generateKeyMatrix must accumulate keyStringIndex across all
    // cells (line 28: keyStringIndex += 1) and correctly populate each cell from left to
    // right and top to bottom with independently calculated shifted values.
    // An accumulation failure (e.g. keyStringIndex += 0) causes all cells to duplicate
    // the first cell value instead of mapping sequential characters.
    // Fixture: 2x2 zero-containing matrix ('A': 0, 'B': 1, 'C': 2, 'D': 3).
    it('generates a 2x2 key matrix with independently calculated cell values', () => {
      const keyMatrix = generateKeyMatrix('ABCD');
      expect(keyMatrix.length).toBe(2);
      expect(keyMatrix[0].length).toBe(2);
      expect(keyMatrix).toEqual([
        [0, 1],
        [2, 3],
      ]);
    });

    // Invariant: avoid applying square-matrix rules to rectangular inputs;
    // generateKeyMatrix only supports square key matrices (matrixSize = Math.sqrt(length)).
    // Rectangular shapes (e.g. 1x2 key length 2, or 2x3 key length 6) must be rejected
    // with an explicit error.
    it('rejects rectangular matrix shapes since key matrices must be square', () => {
      expect(() => generateKeyMatrix('AB')).toThrow(
        'Invalid key string length. The square root of the key string must be an integer',
      );
      expect(() => generateKeyMatrix('ABCDEF')).toThrow(
        'Invalid key string length. The square root of the key string must be an integer',
      );
    });

    // Protected condition: 3x3 key matrix generation with independently calculated cells,
    // containing zero ('A' = 0). Preserves compatibility with Hill Cipher encryption.
    it('generates a 3x3 key matrix containing zero for HILLMAGIC', () => {
      const keyMatrix = generateKeyMatrix('HILLMAGIC');
      expect(keyMatrix.length).toBe(3);
      expect(keyMatrix[0].length).toBe(3);
      expect(keyMatrix).toEqual([
        [7, 8, 11],
        [11, 12, 0],
        [6, 8, 2],
      ]);
    });
  });
});
