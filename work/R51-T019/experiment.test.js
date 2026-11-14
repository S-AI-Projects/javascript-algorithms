import fs from 'fs';
import path from 'path';
import LinkedList from '../../src/data-structures/linked-list/LinkedList';

const evidenceDirectory = __dirname;
const inputs = JSON.parse(fs.readFileSync(path.join(evidenceDirectory, 'inputs.json')));

function createValues(size, seed) {
  let state = seed >>> 0;
  return Array.from({ length: size }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  });
}

function median(values) {
  const sortedValues = [...values].sort((a, b) => a - b);
  return sortedValues[Math.floor(sortedValues.length / 2)];
}

describe('linked-list deleteTail complexity experiment', () => {
  it('checks correctness and records five CPU-only timings at each size', () => {
    const measurements = inputs.sizes.map((size) => {
      const samples = Array.from({ length: inputs.repetitions }, (_, repetition) => {
        const values = createValues(size, inputs.seed + size + repetition);
        const linkedList = new LinkedList().fromArray(values);
        const expected = {
          deletedValue: values[size - 1],
          newTailValue: values[size - 2],
          remainingNodes: size - 1,
        };

        const start = process.hrtime.bigint();
        const deletedNode = linkedList.deleteTail();
        const elapsedMilliseconds = Number(process.hrtime.bigint() - start) / 1e6;

        const nodesAfterDeletion = linkedList.toArray();
        const actual = {
          deletedValue: deletedNode.value,
          newTailValue: linkedList.tail.value,
          remainingNodes: nodesAfterDeletion.length,
          newTailNextIsNull: linkedList.tail.next === null,
        };

        return {
          expected,
          actual,
          elapsedMilliseconds,
        };
      });

      const durations = samples.map((sample) => sample.elapsedMilliseconds);
      return {
        size,
        samples,
        medianMilliseconds: median(durations),
        rangeMilliseconds: {
          minimum: Math.min(...durations),
          maximum: Math.max(...durations),
        },
      };
    });

    const report = {
      operation: inputs.operation,
      inputSizeVariable: 'n (number of nodes)',
      seed: inputs.seed,
      repetitionsPerSize: inputs.repetitions,
      sizes: inputs.sizes,
      timingScope: 'deleteTail() only; list construction and correctness checks are untimed',
      toolVersions: {
        node: process.version,
        v8: process.versions.v8,
        platform: process.platform,
        architecture: process.arch,
      },
      measurements,
    };

    fs.writeFileSync(
      path.join(evidenceDirectory, 'experiment-results.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    );

    measurements.forEach(({ size, samples }) => {
      samples.forEach(({ expected, actual }) => {
        expect(actual.deletedValue).toBe(expected.deletedValue);
        expect(actual.newTailValue).toBe(expected.newTailValue);
        expect(actual.remainingNodes).toBe(expected.remainingNodes);
        expect(actual.newTailNextIsNull).toBe(true);
      });
      expect(samples).toHaveLength(inputs.repetitions);
      expect(size).toBeGreaterThan(1);
    });
  });
});
