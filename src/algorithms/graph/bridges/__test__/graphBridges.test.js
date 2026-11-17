import fs from 'fs';
import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import Graph from '../../../../data-structures/graph/Graph';
import graphBridges, { VisitMetadata } from '../graphBridges';

describe('graphBridges', () => {
  it('should find bridges in simple graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCD = new GraphEdge(vertexC, vertexD);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCD);

    const bridges = Object.values(graphBridges(graph));

    expect(bridges.length).toBe(3);
    expect(bridges[0].getKey()).toBe(edgeCD.getKey());
    expect(bridges[1].getKey()).toBe(edgeBC.getKey());
    expect(bridges[2].getKey()).toBe(edgeAB.getKey());
  });

  it('should find bridges in simple graph with back edge', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCD = new GraphEdge(vertexC, vertexD);
    const edgeAC = new GraphEdge(vertexA, vertexC);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeCD);

    const bridges = Object.values(graphBridges(graph));

    expect(bridges.length).toBe(1);
    expect(bridges[0].getKey()).toBe(edgeCD.getKey());
  });

  it('should find bridges in graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');
    const vertexH = new GraphVertex('H');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeAC = new GraphEdge(vertexA, vertexC);
    const edgeCD = new GraphEdge(vertexC, vertexD);
    const edgeDE = new GraphEdge(vertexD, vertexE);
    const edgeEG = new GraphEdge(vertexE, vertexG);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeGF = new GraphEdge(vertexG, vertexF);
    const edgeFH = new GraphEdge(vertexF, vertexH);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeAC)
      .addEdge(edgeCD)
      .addEdge(edgeDE)
      .addEdge(edgeEG)
      .addEdge(edgeEF)
      .addEdge(edgeGF)
      .addEdge(edgeFH);

    const bridges = Object.values(graphBridges(graph));

    expect(bridges.length).toBe(3);
    expect(bridges[0].getKey()).toBe(edgeFH.getKey());
    expect(bridges[1].getKey()).toBe(edgeDE.getKey());
    expect(bridges[2].getKey()).toBe(edgeCD.getKey());
  });

  it('should find bridges in graph starting with different root vertex', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');
    const vertexH = new GraphVertex('H');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeAC = new GraphEdge(vertexA, vertexC);
    const edgeCD = new GraphEdge(vertexC, vertexD);
    const edgeDE = new GraphEdge(vertexD, vertexE);
    const edgeEG = new GraphEdge(vertexE, vertexG);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeGF = new GraphEdge(vertexG, vertexF);
    const edgeFH = new GraphEdge(vertexF, vertexH);

    const graph = new Graph();

    graph
      .addEdge(edgeDE)
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeAC)
      .addEdge(edgeCD)
      .addEdge(edgeEG)
      .addEdge(edgeEF)
      .addEdge(edgeGF)
      .addEdge(edgeFH);

    const bridges = Object.values(graphBridges(graph));

    expect(bridges.length).toBe(3);
    expect(bridges[0].getKey()).toBe(edgeFH.getKey());
    expect(bridges[1].getKey()).toBe(edgeDE.getKey());
    expect(bridges[2].getKey()).toBe(edgeCD.getKey());
  });

  it('should find bridges in yet another graph #1', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeAC = new GraphEdge(vertexA, vertexC);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCD = new GraphEdge(vertexC, vertexD);
    const edgeDE = new GraphEdge(vertexD, vertexE);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeCD)
      .addEdge(edgeDE);

    const bridges = Object.values(graphBridges(graph));

    expect(bridges.length).toBe(2);
    expect(bridges[0].getKey()).toBe(edgeDE.getKey());
    expect(bridges[1].getKey()).toBe(edgeCD.getKey());
  });

  it('should find bridges in yet another graph #2', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeAC = new GraphEdge(vertexA, vertexC);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCD = new GraphEdge(vertexC, vertexD);
    const edgeCE = new GraphEdge(vertexC, vertexE);
    const edgeCF = new GraphEdge(vertexC, vertexF);
    const edgeEG = new GraphEdge(vertexE, vertexG);
    const edgeFG = new GraphEdge(vertexF, vertexG);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeCD)
      .addEdge(edgeCE)
      .addEdge(edgeCF)
      .addEdge(edgeEG)
      .addEdge(edgeFG);

    const bridges = Object.values(graphBridges(graph));

    expect(bridges.length).toBe(1);
    expect(bridges[0].getKey()).toBe(edgeCD.getKey());
  });

  describe('VisitMetadata deterministic execution & input isolation', () => {
    const fixtures = [
      {
        name: 'smallest valid input (discoveryTime = 0, lowDiscoveryTime = 0)',
        preconditionSource: 'graphBridges.js line 21',
        input: { discoveryTime: 0, lowDiscoveryTime: 0 },
        expected: { discoveryTime: 0, lowDiscoveryTime: 0 },
      },
      {
        name: 'initial vertex discovery (discoveryTime = 1, lowDiscoveryTime = 1)',
        preconditionSource: 'graphBridges.js lines 53-56',
        input: { discoveryTime: 1, lowDiscoveryTime: 1 },
        expected: { discoveryTime: 1, lowDiscoveryTime: 1 },
      },
      {
        name: 'ordinary input with updated low link (discoveryTime = 3, lowDiscoveryTime = 1)',
        preconditionSource: 'graphBridges.js lines 53-56 and lines 71-75',
        input: { discoveryTime: 3, lowDiscoveryTime: 1 },
        expected: { discoveryTime: 3, lowDiscoveryTime: 1 },
      },
    ];

    const interveningFixture = {
      name: 'intervening valid input (discoveryTime = 10, lowDiscoveryTime = 5)',
      input: { discoveryTime: 10, lowDiscoveryTime: 5 },
      expected: { discoveryTime: 10, lowDiscoveryTime: 5 },
    };

    it('instantiates smallest valid input correctly and deterministically', () => {
      // Source precondition: graphBridges.js line 21
      const input = { discoveryTime: 0, lowDiscoveryTime: 0 };
      const expected = { discoveryTime: 0, lowDiscoveryTime: 0 };

      const metadata = new VisitMetadata(input);
      expect(metadata.discoveryTime).toBe(expected.discoveryTime);
      expect(metadata.lowDiscoveryTime).toBe(expected.lowDiscoveryTime);
      expect(metadata).toEqual(expected);
    });

    it('instantiates ordinary input correctly and deterministically', () => {
      // Source precondition: graphBridges.js lines 53-56
      const input = { discoveryTime: 3, lowDiscoveryTime: 1 };
      const expected = { discoveryTime: 3, lowDiscoveryTime: 1 };

      const metadata = new VisitMetadata(input);
      expect(metadata.discoveryTime).toBe(expected.discoveryTime);
      expect(metadata.lowDiscoveryTime).toBe(expected.lowDiscoveryTime);
      expect(metadata).toEqual(expected);
    });

    it('verifies repeated calls, intervening call isolation, and argument immutability', () => {
      const evidenceCases = [];

      fixtures.forEach(({
        name, input, expected, preconditionSource,
      }) => {
        const inputCopy = { ...input };

        // 1. First run in fresh isolated state
        const run1 = new VisitMetadata(input);
        expect(run1).toEqual(expected);
        evidenceCases.push({
          fixture: name,
          preconditionSource,
          run: 'isolated_run_1',
          input: inputCopy,
          expected,
          actual: { discoveryTime: run1.discoveryTime, lowDiscoveryTime: run1.lowDiscoveryTime },
        });

        // 2. Second run in fresh isolated state
        const run2 = new VisitMetadata(input);
        expect(run2).toEqual(expected);
        expect(run2).not.toBe(run1);
        evidenceCases.push({
          fixture: name,
          preconditionSource,
          run: 'isolated_run_2',
          input: inputCopy,
          expected,
          actual: { discoveryTime: run2.discoveryTime, lowDiscoveryTime: run2.lowDiscoveryTime },
        });

        // 3. Intervening run with another valid input
        const interveningRun = new VisitMetadata(interveningFixture.input);
        expect(interveningRun).toEqual(interveningFixture.expected);
        evidenceCases.push({
          fixture: interveningFixture.name,
          preconditionSource: 'intervening',
          run: 'intervening_valid_input',
          input: interveningFixture.input,
          expected: interveningFixture.expected,
          actual: {
            discoveryTime: interveningRun.discoveryTime,
            lowDiscoveryTime: interveningRun.lowDiscoveryTime,
          },
        });

        // 4. Run after intervening input: assert earlier runs do not alter subsequent result
        const run3 = new VisitMetadata(input);
        expect(run3).toEqual(expected);
        expect(run3).not.toBe(run1);
        expect(run3).not.toBe(run2);
        expect(run3).not.toBe(interveningRun);
        evidenceCases.push({
          fixture: name,
          preconditionSource,
          run: 'run_after_intervening_input',
          input: inputCopy,
          expected,
          actual: { discoveryTime: run3.discoveryTime, lowDiscoveryTime: run3.lowDiscoveryTime },
        });

        // 5. Assert mutation isolation: mutating run1 does not alter run2, run3, or fresh run4
        run1.discoveryTime = -999999;
        run1.lowDiscoveryTime = -999999;
        expect(run2).toEqual(expected);
        expect(run3).toEqual(expected);

        const run4 = new VisitMetadata(input);
        expect(run4).toEqual(expected);
        evidenceCases.push({
          fixture: name,
          preconditionSource,
          run: 'run_after_prior_instance_mutation',
          input: inputCopy,
          expected,
          actual: { discoveryTime: run4.discoveryTime, lowDiscoveryTime: run4.lowDiscoveryTime },
        });

        // 6. Assert input argument non-mutation
        expect(input).toEqual(inputCopy);
      });

      if (process.env.VISIT_METADATA_EVIDENCE_PATH) {
        fs.writeFileSync(
          process.env.VISIT_METADATA_EVIDENCE_PATH,
          JSON.stringify(evidenceCases, null, 2),
          'utf-8',
        );
      }
    });
  });
});
