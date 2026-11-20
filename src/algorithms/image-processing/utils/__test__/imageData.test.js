import { getPixel, setPixel } from '../imageData';

/**
 * Independent Reference Oracle:
 * Reconstructs a 2D grid representation from the flat image buffer,
 * accessing pixel data by [row][col] rather than flat index formula (y * width + x).
 *
 * @param {Object} img - { width, height, data }
 * @param {Object} coordinate - { x, y }
 * @returns {Array<number>} - 4-element array [R, G, B, A]
 */
function gridOracle(img, { x, y }) {
  const grid = [];
  const channels = 4;
  for (let row = 0; row < img.height; row += 1) {
    grid[row] = [];
    for (let col = 0; col < img.width; col += 1) {
      const offset = (row * img.width + col) * channels;
      grid[row][col] = [
        img.data[offset],
        img.data[offset + 1],
        img.data[offset + 2],
        img.data[offset + 3],
      ];
    }
  }
  return grid[y][x];
}

describe('imageData utils (R51-T043)', () => {
  describe('getPixel - Stated Fixtures', () => {
    it('handles the smallest valid input (1x1 image at { x: 0, y: 0 })', () => {
      // Preconditions:
      // Line 17 (coordinate destructuring): { x: 0, y: 0 }
      // Line 20 (width): img.width === 1
      // Line 21 (cellsPerColor): 4 channels
      // Line 24 (subarray): img.data is a Uint8ClampedArray
      const rawData = new Uint8ClampedArray([255, 128, 64, 255]);
      const img = {
        width: 1,
        height: 1,
        data: rawData,
      };
      const coordinate = { x: 0, y: 0 };

      const pixel = getPixel(img, coordinate);

      // Independently calculated expected value
      expect(pixel).toBeInstanceOf(Uint8ClampedArray);
      expect(pixel.length).toBe(4);
      expect(Array.from(pixel)).toEqual([255, 128, 64, 255]);
      expect(Array.from(pixel)).toEqual(gridOracle(img, coordinate));
    });

    it('handles one ordinary input (3x3 image at { x: 1, y: 2 })', () => {
      // Preconditions:
      // Line 17 (coordinate destructuring): { x: 1, y: 2 }
      // Line 20 (linear index): i = 2 * 3 + 1 = 7
      // Line 21 (cellsPerColor): 4
      // Line 24 (byte range): [7 * 4, 7 * 4 + 4) = [28, 32)
      const width = 3;
      const height = 3;
      const rawData = new Uint8ClampedArray(width * height * 4);

      // Populate distinct deterministic colors for each pixel
      for (let idx = 0; idx < width * height; idx += 1) {
        rawData[idx * 4] = (idx * 25) % 256;
        rawData[idx * 4 + 1] = (idx * 50 + 10) % 256;
        rawData[idx * 4 + 2] = (idx * 75 + 20) % 256;
        rawData[idx * 4 + 3] = 255;
      }

      const img = { width, height, data: rawData };
      const coordinate = { x: 1, y: 2 };

      const pixel = getPixel(img, coordinate);

      // Index i = 2 * 3 + 1 = 7
      // R = (7 * 25) % 256 = 175
      // G = (7 * 50 + 10) % 256 = 104
      // B = (7 * 75 + 20) % 256 = 89
      // A = 255
      const expectedR = (7 * 25) % 256;
      const expectedG = (7 * 50 + 10) % 256;
      const expectedB = (7 * 75 + 20) % 256;
      const expectedA = 255;

      expect(pixel).toBeInstanceOf(Uint8ClampedArray);
      expect(Array.from(pixel)).toEqual([expectedR, expectedG, expectedB, expectedA]);
      expect(Array.from(pixel)).toEqual(gridOracle(img, coordinate));
    });
  });

  describe('getPixel - Independent Reference Comparison across 22 valid inputs', () => {
    it('matches independent grid oracle across 22 distinct pixel coordinates', () => {
      // Test cases across multiple image dimensions:
      // 1. 1x1 image (1 pixel: (0,0))
      // 2. 2x2 image (4 pixels: (0,0), (1,0), (0,1), (1,1))
      // 3. 3x3 image (9 pixels: 9 combinations)
      // 4. 4x2 image (8 pixels: 8 combinations)
      // Total = 1 + 4 + 9 + 8 = 22 test inputs.

      const configurations = [
        { width: 1, height: 1 },
        { width: 2, height: 2 },
        { width: 3, height: 3 },
        { width: 4, height: 2 },
      ];

      let totalTested = 0;

      configurations.forEach(({ width, height }) => {
        const rawData = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < width * height; i += 1) {
          rawData[i * 4] = (i * 17 + 5) % 256;
          rawData[i * 4 + 1] = (i * 31 + 15) % 256;
          rawData[i * 4 + 2] = (i * 47 + 25) % 256;
          rawData[i * 4 + 3] = (i * 59 + 35) % 256;
        }

        const img = { width, height, data: rawData };

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const coord = { x, y };
            const actual = getPixel(img, coord);
            const expected = gridOracle(img, coord);

            expect(Array.from(actual)).toEqual(expected);
            totalTested += 1;
          }
        }
      });

      expect(totalTested).toBe(22);
    });
  });

  describe('getPixel - Immutability & Input Isolation', () => {
    it('does not mutate img data, dimensions, or coordinate parameter', () => {
      const originalData = new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80]);
      const initialBufferCopy = new Uint8ClampedArray(originalData);
      const img = {
        width: 2,
        height: 1,
        data: originalData,
      };
      const coordinate = Object.freeze({ x: 1, y: 0 });

      const pixel = getPixel(img, coordinate);

      expect(Array.from(pixel)).toEqual([50, 60, 70, 80]);
      expect(Array.from(img.data)).toEqual(Array.from(initialBufferCopy));
      expect(img.width).toBe(2);
      expect(img.height).toBe(1);
      expect(coordinate.x).toBe(1);
      expect(coordinate.y).toBe(0);
    });
  });

  describe('setPixel', () => {
    it('sets pixel color and allows getPixel to read back the updated value', () => {
      const img = {
        width: 2,
        height: 2,
        data: new Uint8ClampedArray(16),
      };

      setPixel(img, { x: 1, y: 1 }, [11, 22, 33, 44]);
      const pixel = getPixel(img, { x: 1, y: 1 });

      expect(Array.from(pixel)).toEqual([11, 22, 33, 44]);
    });
  });
});
