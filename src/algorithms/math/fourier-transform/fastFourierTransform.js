import ComplexNumber from '../complex-number/ComplexNumber';
import bitLength from '../bits/bitLength';

/**
 * Reverse the bit order of a number across a specified bit width.
 *
 * Contract & Specification:
 * - Total / Pure Function:
 *   - Pure deterministic function with zero external side effects and no observable mutation
 *     of inputs, caller state, or global environment.
 * - Input Domain:
 *   - input {number}: Non-negative integer whose lower `bitsCount` bits will be reversed.
 *   - bitsCount {number}: Non-negative integer defining the bitfield sequence length / width.
 * - Return Value:
 *   - {number}: Non-negative integer in range [0, 2^bitsCount - 1] whose binary representation
 *     is the exact mirror image of the input's lower `bitsCount` bits.
 * - Sequence Mapping & Semantics:
 *   - Maps sequence [b_0, b_1, ..., b_{bitsCount - 1}] to [b_{bitsCount - 1}, ..., b_1, b_0],
 *     where b_0 is the least significant bit (2^0) and b_{bitsCount - 1} is at 2^{bitsCount - 1}.
 *   - Empty supported sequence: bitsCount = 0 returns 0 (loop range is empty).
 *   - Singleton sequence: bitsCount = 1 returns the single bit [A] -> [A]
 *     (e.g., 0 -> 0, 1 -> 1).
 *   - Three-element sequence: bitsCount = 3 reverses [A, B, C] -> [C, B, A].
 *     e.g., input 1 (binary 001, [1, 0, 0]) -> 4 (binary 100, [0, 0, 1]),
 *           input 3 (binary 011, [1, 1, 0]) -> 6 (binary 110, [0, 1, 1]).
 *   - Repeated-value / domain boundary:
 *     input 0 (binary 000, [0, 0, 0]) -> 0, input 7 (binary 111, [1, 1, 1]) -> 7.
 *   - Involutory property:
 *     For all valid inputs, reverseBits(reverseBits(x, bitsCount), bitsCount) === x.
 * - Distinction Between Bit Sequences and String Code Points / Bytes:
 *   - `reverseBits` operates strictly on bit representations of integer values.
 *   - Numeric strings passed as input are coerced via JS numeric division.
 *   - In contrast to character reversal where Unicode code points (e.g. surrogate pairs)
 *     must be preserved as atomic scalar values rather than broken across UTF-8/UTF-16 bytes,
 *     bit-reversal operates directly on bit indices 0 to bitsCount - 1.
 *
 * @param {number} input - Integer whose lower bitsCount bits will be reversed.
 * @param {number} bitsCount - Number of bits in the sequence to reverse.
 * @return {number} - The integer resulting from reversing the lower bitsCount bits.
 */
export function reverseBits(input, bitsCount) {
  let reversedBits = 0;

  for (let bitIndex = 0; bitIndex < bitsCount; bitIndex += 1) {
    reversedBits *= 2;

    if (Math.floor(input / (1 << bitIndex)) % 2 === 1) {
      reversedBits += 1;
    }
  }

  return reversedBits;
}

/**
 * Returns the radix-2 fast fourier transform of the given array.
 * Optionally computes the radix-2 inverse fast fourier transform.
 *
 * @param {ComplexNumber[]} inputData
 * @param {boolean} [inverse]
 * @return {ComplexNumber[]}
 */
export default function fastFourierTransform(inputData, inverse = false) {
  const bitsCount = bitLength(inputData.length - 1);
  const N = 1 << bitsCount;

  while (inputData.length < N) {
    inputData.push(new ComplexNumber());
  }

  const output = [];
  for (let dataSampleIndex = 0; dataSampleIndex < N; dataSampleIndex += 1) {
    output[dataSampleIndex] = inputData[reverseBits(dataSampleIndex, bitsCount)];
  }

  for (let blockLength = 2; blockLength <= N; blockLength *= 2) {
    const imaginarySign = inverse ? -1 : 1;
    const phaseStep = new ComplexNumber({
      re: Math.cos((2 * Math.PI) / blockLength),
      im: imaginarySign * Math.sin((2 * Math.PI) / blockLength),
    });

    for (let blockStart = 0; blockStart < N; blockStart += blockLength) {
      let phase = new ComplexNumber({ re: 1, im: 0 });

      for (let signalId = blockStart; signalId < (blockStart + blockLength / 2); signalId += 1) {
        const component = output[signalId + blockLength / 2].multiply(phase);

        const upd1 = output[signalId].add(component);
        const upd2 = output[signalId].subtract(component);

        output[signalId] = upd1;
        output[signalId + blockLength / 2] = upd2;

        phase = phase.multiply(phaseStep);
      }
    }
  }

  if (inverse) {
    for (let signalId = 0; signalId < N; signalId += 1) {
      output[signalId] /= N;
    }
  }

  return output;
}
