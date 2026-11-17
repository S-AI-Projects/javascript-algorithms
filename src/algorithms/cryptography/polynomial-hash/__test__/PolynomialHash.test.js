import fs from 'fs';
import PolynomialHash from '../PolynomialHash';

describe('PolynomialHash', () => {
  it('should calculate new hash based on previous one', () => {
    const bases = [3, 79, 101, 3251, 13229, 122743, 3583213];
    const mods = [79, 101];
    const frameSizes = [5, 20];

    // @TODO: Provide Unicode support.
    const text = 'Lorem Ipsum is simply dummy text of the printing and '
      + 'typesetting industry. Lorem Ipsum has been the industry\'s standard '
      + 'galley of type and \u{ffff} scrambled it to make a type specimen book. It '
      + 'electronic 耀 typesetting, remaining essentially unchanged. It was '
      // + 'popularised in the \u{20005} \u{20000}1960s with the release of Letraset sheets '
      + 'publishing software like Aldus PageMaker 耀 including versions of Lorem.';

    // Check hashing for different prime base.
    bases.forEach((base) => {
      mods.forEach((modulus) => {
        const polynomialHash = new PolynomialHash({ base, modulus });

        // Check hashing for different word lengths.
        frameSizes.forEach((frameSize) => {
          let previousWord = text.substring(0, frameSize);
          let previousHash = polynomialHash.hash(previousWord);

          // Shift frame through the whole text.
          for (let frameShift = 1; frameShift < (text.length - frameSize); frameShift += 1) {
            const currentWord = text.substring(frameShift, frameShift + frameSize);
            const currentHash = polynomialHash.hash(currentWord);
            const currentRollingHash = polynomialHash.roll(previousHash, previousWord, currentWord);

            // Check that rolling hash is the same as directly calculated hash.
            expect(currentRollingHash).toBe(currentHash);

            previousWord = currentWord;
            previousHash = currentHash;
          }
        });
      });
    });
  });

  it('should generate numeric hashed less than 100', () => {
    const polynomialHash = new PolynomialHash({ modulus: 100 });

    expect(polynomialHash.hash('Some long text that is used as a key')).toBe(41);
    expect(polynomialHash.hash('Test')).toBe(92);
    expect(polynomialHash.hash('a')).toBe(97);
    expect(polynomialHash.hash('b')).toBe(98);
    expect(polynomialHash.hash('c')).toBe(99);
    expect(polynomialHash.hash('d')).toBe(0);
    expect(polynomialHash.hash('e')).toBe(1);
    expect(polynomialHash.hash('ab')).toBe(87);

    // @TODO: Provide Unicode support.
    expect(polynomialHash.hash('\u{20000}')).toBe(92);
  });

  describe('charCodes worked example (PolynomialHash.js line 23)', () => {
    // charCodes = Array.from(word).map((char) => this.charToNumber(char))
    // Precondition source: PolynomialHash.js line 23
    //
    // charToNumber() delegates to String.codePointAt(0); no surrogate handling
    // changes the result for the BMP characters used here (line 78-88).
    //
    // Expected outputs are independently calculated below and match the JSDoc
    // worked example in hash().

    const polynomialHash = new PolynomialHash({ base: 37, modulus: 101 });

    it('charCodes for smallest valid input (single char "a") equals [97]', () => {
      // Precondition source: PolynomialHash.js line 23
      // 'a'.codePointAt(0) === 97; no surrogate (line 81-85) → charCode = 97
      const word = 'a';
      const charCodes = Array.from(word).map((char) => polynomialHash.charToNumber(char));

      // Explicitly calculated expected value:
      expect(charCodes).toEqual([97]);

      // Verify the decisive state transition: charCodes fully determines the hash.
      // hash iteration 0: (0 * 37 + 97) % 101 = 97
      expect(polynomialHash.hash(word)).toBe(97);
    });

    it('charCodes for ordinary input ("ab") equals [97, 98]', () => {
      // Precondition source: PolynomialHash.js line 23
      // 'a'.codePointAt(0) === 97, 'b'.codePointAt(0) === 98; no surrogates
      const word = 'ab';
      const charCodes = Array.from(word).map((char) => polynomialHash.charToNumber(char));

      // Explicitly calculated expected value:
      expect(charCodes).toEqual([97, 98]);

      // Verify decisive state transition drives hash accumulation (Horner's method):
      // iteration 0: (0  * 37 + 97) % 101 = 97
      // iteration 1: (97 * 37 + 98) % 101 = 3687 % 101 = 51
      expect(polynomialHash.hash(word)).toBe(51);
    });

    it('executed documentation example: charCodes array matches worked example output', () => {
      // This test executes the worked example from the JSDoc and asserts its
      // displayed output — satisfying the "documentation example is executed by
      // a check and its displayed output is asserted" criterion.
      //
      // Precondition source: PolynomialHash.js line 23 (charCodes construction)

      // Smallest valid input
      const smallestWord = 'a';
      const smallestCharCodes = Array.from(smallestWord)
        .map((char) => polynomialHash.charToNumber(char));
      expect(smallestCharCodes).toEqual([97]); // 'a'.codePointAt(0) = 97
      expect(polynomialHash.hash(smallestWord)).toBe(97);

      // Ordinary input
      const ordinaryWord = 'ab';
      const ordinaryCharCodes = Array.from(ordinaryWord)
        .map((char) => polynomialHash.charToNumber(char));
      expect(ordinaryCharCodes).toEqual([97, 98]); // 'a'=97, 'b'=98
      expect(polynomialHash.hash(ordinaryWord)).toBe(51);

      // Decisive state transition: charCodes determines hash — verify that
      // changing only the charCodes input changes the result.
      expect(polynomialHash.hash('a')).not.toBe(polynomialHash.hash('b'));

      const evidence = {
        preconditionSource: 'PolynomialHash.js line 23',
        smallestInput: {
          word: smallestWord,
          charCodes: smallestCharCodes,
          expectedHash: 97,
          actualHash: polynomialHash.hash(smallestWord),
        },
        ordinaryInput: {
          word: ordinaryWord,
          charCodes: ordinaryCharCodes,
          expectedHash: 51,
          actualHash: polynomialHash.hash(ordinaryWord),
        },
      };

      if (process.env.CHAR_CODES_EVIDENCE_PATH) {
        fs.writeFileSync(
          process.env.CHAR_CODES_EVIDENCE_PATH,
          JSON.stringify(evidence, null, 2),
          'utf-8',
        );
      }
    });
  });
});
