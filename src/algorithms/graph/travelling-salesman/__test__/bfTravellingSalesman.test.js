import fs from 'fs';
import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import Graph from '../../../../data-structures/graph/Graph';
import bfTravellingSalesman, { findAllPaths } from '../bfTravellingSalesman';

describe('bfTravellingSalesman', () => {
  it('should solve problem for simple graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');

    const edgeAB = new GraphEdge(vertexA, vertexB, 1);
    const edgeBD = new GraphEdge(vertexB, vertexD, 1);
    const edgeDC = new GraphEdge(vertexD, vertexC, 1);
    const edgeCA = new GraphEdge(vertexC, vertexA, 1);

    const edgeBA = new GraphEdge(vertexB, vertexA, 5);
    const edgeDB = new GraphEdge(vertexD, vertexB, 8);
    const edgeCD = new GraphEdge(vertexC, vertexD, 7);
    const edgeAC = new GraphEdge(vertexA, vertexC, 4);
    const edgeAD = new GraphEdge(vertexA, vertexD, 2);
    const edgeDA = new GraphEdge(vertexD, vertexA, 3);
    const edgeBC = new GraphEdge(vertexB, vertexC, 3);
    const edgeCB = new GraphEdge(vertexC, vertexB, 9);

    const graph = new Graph(true);
    graph
      .addEdge(edgeAB)
      .addEdge(edgeBD)
      .addEdge(edgeDC)
      .addEdge(edgeCA)
      .addEdge(edgeBA)
      .addEdge(edgeDB)
      .addEdge(edgeCD)
      .addEdge(edgeAC)
      .addEdge(edgeAD)
      .addEdge(edgeDA)
      .addEdge(edgeBC)
      .addEdge(edgeCB);

    const salesmanPath = bfTravellingSalesman(graph);

    expect(salesmanPath.length).toBe(4);

    expect(salesmanPath[0].getKey()).toEqual(vertexA.getKey());
    expect(salesmanPath[1].getKey()).toEqual(vertexB.getKey());
    expect(salesmanPath[2].getKey()).toEqual(vertexD.getKey());
    expect(salesmanPath[3].getKey()).toEqual(vertexC.getKey());
  });

  describe('findAllPaths', () => {
    const evidenceCases = [];

    it('should find all paths for the smallest valid input (isolated single vertex)', () => {
      // Source line preconditions:
      // Line 7: paths and path default to [].
      // Line 17: vertex.getKey() is callable on startVertex.
      // Line 23: startVertex.getNeighbors() returns empty array.
      // Line 28: !unvisitedNeighbors.length evaluates to true.
      // Line 29: paths.push(currentPath) records current path.
      const vertexA = new GraphVertex('A');

      // Precondition verification:
      expect(typeof vertexA.getKey).toBe('function');
      expect(vertexA.getKey()).toBe('A');
      expect(vertexA.getNeighbors()).toEqual([]);

      // Literal input: single isolated vertex with no incident edges.
      // Independently calculated expected output: one path containing only vertex A.
      const expectedPathKeys = [['A']];
      const paths = findAllPaths(vertexA);

      expect(paths.length).toBe(1);
      expect(paths[0].length).toBe(1);
      expect(paths[0][0]).toBe(vertexA);

      const actualPathKeys = paths.map((path) => path.map((vertex) => vertex.getKey()));
      expect(actualPathKeys).toEqual(expectedPathKeys);

      evidenceCases.push({
        name: 'smallest valid input (isolated single vertex)',
        fixture: 'smallest valid input',
        input: {
          startVertex: 'A',
          graphEdges: [],
        },
        preconditions: [
          'bfTravellingSalesman.js:7: default parameter paths = [], path = []',
          'bfTravellingSalesman.js:17: updatedAccumulator[vertex.getKey()] requires getKey()',
          'bfTravellingSalesman.js:23: startVertex.getNeighbors() requires getNeighbors()',
          'bfTravellingSalesman.js:28: !unvisitedNeighbors.length decisive base transition',
        ],
        decisive_state_transition: (
          'unvisitedNeighbors.length === 0 triggers base case at line 28, '
          + 'saving [A]'
        ),
        expected: expectedPathKeys,
        actual: actualPathKeys,
        status: 'passed',
      });
    });

    it('should find all paths for an ordinary input (triangle graph)', () => {
      // Source line preconditions:
      // Line 17: getKey() provides vertex identity for visitedSet.
      // Line 23: getNeighbors() provides neighbor array.
      // Line 24: !visitedSet[neighbor.getKey()] filters out visited neighbors.
      // Line 28: !unvisitedNeighbors.length triggers base case at path completion.
      // Line 35-38: loop over unvisitedNeighbors recurses for each branch.
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const vertexC = new GraphVertex('C');

      const edgeAB = new GraphEdge(vertexA, vertexB);
      const edgeBC = new GraphEdge(vertexB, vertexC);
      const edgeAC = new GraphEdge(vertexA, vertexC);

      const graph = new Graph();
      graph
        .addEdge(edgeAB)
        .addEdge(edgeBC)
        .addEdge(edgeAC);

      // Precondition verification:
      expect(vertexA.getNeighbors().map((v) => v.getKey())).toEqual(['B', 'C']);
      expect(vertexB.getNeighbors().map((v) => v.getKey())).toEqual(['A', 'C']);
      expect(vertexC.getNeighbors().map((v) => v.getKey())).toEqual(['B', 'A']);

      // Intermediate state calculation by hand:
      // Step 1: Start at A -> currentPath: [A], unvisited: [B, C]
      // Step 2a: Visit B -> currentPath: [A, B], unvisited: [C]
      // Step 3a: Visit C -> currentPath: [A, B, C], unvisited: []
      //          Decisive transition (line 28): unvisited.length === 0 -> push [A, B, C]
      // Step 2b: Backtrack to A, Visit C -> currentPath: [A, C], unvisited: [B]
      // Step 3b: Visit B -> currentPath: [A, C, B], unvisited: []
      //          Decisive transition (line 28): unvisited.length === 0 -> push [A, C, B]
      // Literal inputs: vertexA in triangle graph (A-B, B-C, A-C).
      // Independently calculated expected output: two maximal simple paths.
      const expectedPathKeys = [
        ['A', 'B', 'C'],
        ['A', 'C', 'B'],
      ];

      const paths = findAllPaths(vertexA);

      expect(paths.length).toBe(2);
      expect(paths[0].map((v) => v.getKey())).toEqual(expectedPathKeys[0]);
      expect(paths[1].map((v) => v.getKey())).toEqual(expectedPathKeys[1]);

      const actualPathKeys = paths.map((path) => path.map((vertex) => vertex.getKey()));
      expect(actualPathKeys).toEqual(expectedPathKeys);

      evidenceCases.push({
        name: 'ordinary input (triangle graph)',
        fixture: 'ordinary input',
        input: {
          startVertex: 'A',
          graphEdges: ['A-B', 'B-C', 'A-C'],
        },
        preconditions: [
          'bfTravellingSalesman.js:17: updatedAccumulator accumulates visited vertices',
          'bfTravellingSalesman.js:23: startVertex.getNeighbors() returns adjacent vertices',
          'bfTravellingSalesman.js:24: !visitedSet[neighbor.getKey()] filters visited',
          'bfTravellingSalesman.js:28: !unvisitedNeighbors.length decisive transition',
          'bfTravellingSalesman.js:35-38: loop advances along each unvisited neighbor',
        ],
        decisive_state_transition: (
          'unvisitedNeighbors.length === 0 triggers base case at line 28 '
          + 'for each maximal branch'
        ),
        expected: expectedPathKeys,
        actual: actualPathKeys,
        status: 'passed',
      });
    });

    it('should execute the documentation example and produce the asserted output', () => {
      // Documentation example executed verbatim:
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const vertexC = new GraphVertex('C');

      const graph = new Graph();
      graph
        .addEdge(new GraphEdge(vertexA, vertexB))
        .addEdge(new GraphEdge(vertexB, vertexC))
        .addEdge(new GraphEdge(vertexA, vertexC));

      const paths = findAllPaths(vertexA);
      const displayedOutput = paths.map((p) => p.map((v) => v.getKey()));

      const expectedDisplayedOutput = [
        ['A', 'B', 'C'],
        ['A', 'C', 'B'],
      ];

      expect(displayedOutput).toEqual(expectedDisplayedOutput);

      evidenceCases.push({
        name: 'documentation worked example',
        fixture: 'documentation example',
        input: {
          startVertex: 'A',
          graphEdges: ['A-B', 'B-C', 'A-C'],
        },
        preconditions: [
          'bfTravellingSalesman.js:17: vertex.getKey() identifier check',
          'bfTravellingSalesman.js:23: startVertex.getNeighbors() neighbor exploration',
          'bfTravellingSalesman.js:28: !unvisitedNeighbors.length decisive terminal check',
        ],
        decisive_state_transition: (
          'Base case line 28 pushes completed path whenever unvisitedNeighbors '
          + 'is empty'
        ),
        expected: expectedDisplayedOutput,
        actual: displayedOutput,
        status: 'passed',
      });
    });

    it('should preserve non-mutation for path prefix and graph vertices', () => {
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const edgeAB = new GraphEdge(vertexA, vertexB);
      const graph = new Graph();
      graph.addEdge(edgeAB);

      const externalPrefix = [new GraphVertex('Z')];
      const externalPrefixBefore = [...externalPrefix];
      const pathsAccumulator = [];

      const result = findAllPaths(vertexA, pathsAccumulator, externalPrefix);

      // Line 9 (const currentPath = [...path]) guarantees externalPrefix is not mutated
      expect(externalPrefix).toEqual(externalPrefixBefore);
      expect(pathsAccumulator).toBe(result);
      expect(vertexA.getNeighbors().map((v) => v.getKey())).toEqual(['B']);

      evidenceCases.push({
        name: 'non-mutation of input prefix array and vertex neighbors',
        fixture: 'immutability check',
        input: {
          startVertex: 'A',
          pathPrefix: ['Z'],
        },
        preconditions: [
          'bfTravellingSalesman.js:9: const currentPath = [...path] isolates traversal',
        ],
        decisive_state_transition: (
          'Array cloning preserves caller input while recursion accumulates paths'
        ),
        expected: {
          externalPrefixUnchanged: true,
          pathsAccumulatorReturned: true,
        },
        actual: {
          externalPrefixUnchanged: (
            externalPrefix.length === 1 && externalPrefix[0].getKey() === 'Z'
          ),
          pathsAccumulatorReturned: pathsAccumulator === result,
        },
        status: 'passed',
      });
    });

    afterAll(() => {
      if (process.env.FIND_ALL_PATHS_EVIDENCE_PATH) {
        fs.writeFileSync(
          process.env.FIND_ALL_PATHS_EVIDENCE_PATH,
          JSON.stringify(evidenceCases, null, 2),
          'utf-8',
        );
      }
    });
  });
});
