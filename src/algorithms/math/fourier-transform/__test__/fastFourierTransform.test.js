import fastFourierTransform, { reverseBits } from '../fastFourierTransform';
import ComplexNumber from '../../complex-number/ComplexNumber';

/**
 * @param {ComplexNumber[]} sequence1
 * @param {ComplexNumber[]} sequence2
 * @param {Number} delta
 * @return {boolean}
 */
function sequencesApproximatelyEqual(sequence1, sequence2, delta) {
  if (sequence1.length !== sequence2.length) {
    return false;
  }

  for (let numberIndex = 0; numberIndex < sequence1.length; numberIndex += 1) {
    if (Math.abs(sequence1[numberIndex].re - sequence2[numberIndex].re) > delta) {
      return false;
    }

    if (Math.abs(sequence1[numberIndex].im - sequence2[numberIndex].im) > delta) {
      return false;
    }
  }

  return true;
}

const delta = 1e-6;

describe('fastFourierTransform', () => {
  it('should calculate the radix-2 discrete fourier transform #1', () => {
    const input = [new ComplexNumber({ re: 0, im: 0 })];
    const expectedOutput = [new ComplexNumber({ re: 0, im: 0 })];
    const output = fastFourierTransform(input);
    const invertedOutput = fastFourierTransform(output, true);

    expect(sequencesApproximatelyEqual(expectedOutput, output, delta)).toBe(true);
    expect(sequencesApproximatelyEqual(input, invertedOutput, delta)).toBe(true);
  });

  it('should calculate the radix-2 discrete fourier transform #2', () => {
    const input = [
      new ComplexNumber({ re: 1, im: 2 }),
      new ComplexNumber({ re: 2, im: 3 }),
      new ComplexNumber({ re: 8, im: 4 }),
    ];

    const expectedOutput = [
      new ComplexNumber({ re: 11, im: 9 }),
      new ComplexNumber({ re: -10, im: 0 }),
      new ComplexNumber({ re: 7, im: 3 }),
      new ComplexNumber({ re: -4, im: -4 }),
    ];

    const output = fastFourierTransform(input);
    const invertedOutput = fastFourierTransform(output, true);

    expect(sequencesApproximatelyEqual(expectedOutput, output, delta)).toBe(true);
    expect(sequencesApproximatelyEqual(input, invertedOutput, delta)).toBe(true);
  });

  it('should calculate the radix-2 discrete fourier transform #3', () => {
    const input = [
      new ComplexNumber({ re: -83656.9359385182, im: 98724.08038374918 }),
      new ComplexNumber({ re: -47537.415125808424, im: 88441.58381765135 }),
      new ComplexNumber({ re: -24849.657029355192, im: -72621.79007878687 }),
      new ComplexNumber({ re: 31451.27290052717, im: -21113.301128347346 }),
      new ComplexNumber({ re: 13973.90836288876, im: -73378.36721594246 }),
      new ComplexNumber({ re: 14981.520420492234, im: 63279.524958963884 }),
      new ComplexNumber({ re: -9892.575367044381, im: -81748.44671677813 }),
      new ComplexNumber({ re: -35933.00356823792, im: -46153.47157161784 }),
      new ComplexNumber({ re: -22425.008561855735, im: -86284.24507370662 }),
      new ComplexNumber({ re: -39327.43830818355, im: 30611.949874562706 }),
    ];

    const expectedOutput = [
      new ComplexNumber({ re: -203215.3322151, im: -100242.4827503 }),
      new ComplexNumber({ re: 99217.0805705, im: 270646.9331932 }),
      new ComplexNumber({ re: -305990.9040412, im: 68224.8435751 }),
      new ComplexNumber({ re: -14135.7758282, im: 199223.9878095 }),
      new ComplexNumber({ re: -306965.6350922, im: 26030.1025439 }),
      new ComplexNumber({ re: -76477.6755206, im: 40781.9078990 }),
      new ComplexNumber({ re: -48409.3099088, im: 54674.7959662 }),
      new ComplexNumber({ re: -329683.0131713, im: 164287.7995937 }),
      new ComplexNumber({ re: -50485.2048527, im: -330375.0546527 }),
      new ComplexNumber({ re: 122235.7738708, im: 91091.6398019 }),
      new ComplexNumber({ re: 47625.8850387, im: 73497.3981523 }),
      new ComplexNumber({ re: -15619.8231136, im: 80804.8685410 }),
      new ComplexNumber({ re: 192234.0276101, im: 160833.3072355 }),
      new ComplexNumber({ re: -96389.4195635, im: 393408.4543872 }),
      new ComplexNumber({ re: -173449.0825417, im: 146875.7724104 }),
      new ComplexNumber({ re: -179002.5662573, im: 239821.0124341 }),
    ];

    const output = fastFourierTransform(input);
    const invertedOutput = fastFourierTransform(output, true);

    expect(sequencesApproximatelyEqual(expectedOutput, output, delta)).toBe(true);
    expect(sequencesApproximatelyEqual(input, invertedOutput, delta)).toBe(true);
  });

  describe('reverseBits (contract & regression tests)', () => {
    describe('empty supported value (smallest supported domain boundary)', () => {
      it('returns 0 when reversing a sequence of length 0 (bitsCount = 0)', () => {
        // Empty bit sequence: bitsCount = 0 represents an empty collection of bits.
        // The function immediately returns 0 without entering the bit traversal loop.
        expect(reverseBits(0, 0)).toBe(0);
        expect(reverseBits(1, 0)).toBe(0);
        expect(reverseBits(5, 0)).toBe(0);
        expect(reverseBits(255, 0)).toBe(0);
      });
    });

    describe('singleton sequence (bitsCount = 1)', () => {
      it('preserves a single bit [A] -> [A]', () => {
        // Smallest non-empty domain: 1-bit sequence [A].
        // For bit 0: [0] -> [0]
        expect(reverseBits(0, 1)).toBe(0);
        // For bit 1: [1] -> [1]
        expect(reverseBits(1, 1)).toBe(1);

        // Masking behavior on higher numbers (only bit 0 is considered)
        expect(reverseBits(2, 1)).toBe(0); // binary 10, bit 0 is 0
        expect(reverseBits(3, 1)).toBe(1); // binary 11, bit 0 is 1
      });
    });

    describe('three-element sequence [A, B, C] -> [C, B, A] (bitsCount = 3)', () => {
      it('reverses asymmetric bit patterns correctly', () => {
        // Fixture: bits [A, B, C] at positions 0, 1, 2 (LSB to MSB)
        // Input integer value: A*1 + B*2 + C*4
        // Output integer value: C*1 + B*2 + A*4
        //
        // [1, 0, 0] (input 1, binary 001) -> [0, 0, 1] (output 4, binary 100)
        expect(reverseBits(1, 3)).toBe(4);

        // [0, 0, 1] (input 4, binary 100) -> [1, 0, 0] (output 1, binary 001)
        expect(reverseBits(4, 3)).toBe(1);

        // [1, 1, 0] (input 3, binary 011) -> [0, 1, 1] (output 6, binary 110)
        expect(reverseBits(3, 3)).toBe(6);

        // [0, 1, 1] (input 6, binary 110) -> [1, 1, 0] (output 3, binary 011)
        expect(reverseBits(6, 3)).toBe(3);
      });

      it('correctly handles symmetric palindrome sequences', () => {
        // Palindromes are invariant under reversal:
        // [0, 1, 0] (input 2, binary 010) -> [0, 1, 0] (output 2, binary 010)
        expect(reverseBits(2, 3)).toBe(2);

        // [1, 0, 1] (input 5, binary 101) -> [1, 0, 1] (output 5, binary 101)
        expect(reverseBits(5, 3)).toBe(5);
      });

      it('correctly handles repeated-value domain boundaries', () => {
        // All zeros: [0, 0, 0] (input 0, binary 000) -> [0, 0, 0] (output 0)
        expect(reverseBits(0, 3)).toBe(0);

        // All ones: [1, 1, 1] (input 7, binary 111) -> [1, 1, 1] (output 7)
        expect(reverseBits(7, 3)).toBe(7);
      });

      it('satisfies the involutory property (double reversal restores original)', () => {
        // Reversing twice across the same bit width must return the original number:
        // reverseBits(reverseBits(x, 3), 3) === x
        for (let x = 0; x < 8; x += 1) {
          expect(reverseBits(reverseBits(x, 3), 3)).toBe(x);
        }
      });
    });

    describe('string representations and code point vs byte distinction', () => {
      it('handles numeric string inputs via arithmetic coercion', () => {
        // When numeric strings are passed, JS arithmetic operations coerce them to numbers
        expect(reverseBits('1', 3)).toBe(4);
        expect(reverseBits('3', 3)).toBe(6);
        expect(reverseBits('6', 3)).toBe(3);
        expect(reverseBits('0', 0)).toBe(0);
      });

      it('distinguishes character code points from binary byte representations', () => {
        // ASCII character 'A': code point 65 (0x41), binary 01000001 (8-bit)
        // Bit reversal of 8-bit 01000001 yields 10000010 (binary) = 130 (decimal)
        const asciiA = 'A'.codePointAt(0);
        expect(asciiA).toBe(65);
        expect(reverseBits(asciiA, 8)).toBe(130);

        // ASCII character 'B': code point 66 (0x42), binary 01000010 (8-bit)
        // Bit reversal of 8-bit 01000010 yields 01000010 (binary) = 66 (palindrome)
        const asciiB = 'B'.codePointAt(0);
        expect(asciiB).toBe(66);
        expect(reverseBits(asciiB, 8)).toBe(66);

        // ASCII character 'C': code point 67 (0x43), binary 01000011 (8-bit)
        // Bit reversal of 8-bit 01000011 yields 11000010 (binary) = 194 (decimal)
        const asciiC = 'C'.codePointAt(0);
        expect(asciiC).toBe(67);
        expect(reverseBits(asciiC, 8)).toBe(194);

        // Surrogate pair / non-BMP Unicode character '😀' (U+1F600):
        // Single Unicode code point (127760), but 2 UTF-16 code units and 4 UTF-8 bytes.
        // Demonstrates code point preservation vs byte-level fragmentation.
        const emoji = '😀';
        expect(emoji.length).toBe(2);
        expect(Array.from(emoji).length).toBe(1);
        expect(emoji.codePointAt(0)).toBe(0x1F600);
      });
    });

    describe('mutation isolation and pure function contract', () => {
      it('does not mutate caller state, arguments, or environment', () => {
        const callerContext = {
          appId: 'fourier-transform-contract-check',
          runCount: 1,
          sequence: [1, 2, 3],
        };
        const originalInput = 3;
        const originalBitsCount = 3;

        const result = reverseBits(originalInput, originalBitsCount);

        // Result correctness
        expect(result).toBe(6);

        // Caller state immutability
        expect(callerContext.appId).toBe('fourier-transform-contract-check');
        expect(callerContext.runCount).toBe(1);
        expect(callerContext.sequence).toEqual([1, 2, 3]);

        // Primitive arguments preserved
        expect(originalInput).toBe(3);
        expect(originalBitsCount).toBe(3);
      });
    });
  });
});
