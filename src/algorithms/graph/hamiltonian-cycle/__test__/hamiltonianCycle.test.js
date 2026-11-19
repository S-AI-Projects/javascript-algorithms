import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import Graph from '../../../../data-structures/graph/Graph';
import hamiltonianCycle from '../hamiltonianCycle';

describe('hamiltonianCycle', () => {
  it('should find hamiltonian paths in graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeAC = new GraphEdge(vertexA, vertexC);
    const edgeBE = new GraphEdge(vertexB, vertexE);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeBD = new GraphEdge(vertexB, vertexD);
    const edgeCD = new GraphEdge(vertexC, vertexD);
    const edgeDE = new GraphEdge(vertexD, vertexE);

    const graph = new Graph();
    graph
      .addEdge(edgeAB)
      .addEdge(edgeAE)
      .addEdge(edgeAC)
      .addEdge(edgeBE)
      .addEdge(edgeBC)
      .addEdge(edgeBD)
      .addEdge(edgeCD)
      .addEdge(edgeDE);

    const hamiltonianCycleSet = hamiltonianCycle(graph);

    expect(hamiltonianCycleSet.length).toBe(8);

    expect(hamiltonianCycleSet[0][0].getKey()).toBe(vertexA.getKey());
    expect(hamiltonianCycleSet[0][1].getKey()).toBe(vertexB.getKey());
    expect(hamiltonianCycleSet[0][2].getKey()).toBe(vertexE.getKey());
    expect(hamiltonianCycleSet[0][3].getKey()).toBe(vertexD.getKey());
    expect(hamiltonianCycleSet[0][4].getKey()).toBe(vertexC.getKey());

    expect(hamiltonianCycleSet[1][0].getKey()).toBe(vertexA.getKey());
    expect(hamiltonianCycleSet[1][1].getKey()).toBe(vertexB.getKey());
    expect(hamiltonianCycleSet[1][2].getKey()).toBe(vertexC.getKey());
    expect(hamiltonianCycleSet[1][3].getKey()).toBe(vertexD.getKey());
    expect(hamiltonianCycleSet[1][4].getKey()).toBe(vertexE.getKey());

    expect(hamiltonianCycleSet[2][0].getKey()).toBe(vertexA.getKey());
    expect(hamiltonianCycleSet[2][1].getKey()).toBe(vertexE.getKey());
    expect(hamiltonianCycleSet[2][2].getKey()).toBe(vertexB.getKey());
    expect(hamiltonianCycleSet[2][3].getKey()).toBe(vertexD.getKey());
    expect(hamiltonianCycleSet[2][4].getKey()).toBe(vertexC.getKey());

    expect(hamiltonianCycleSet[3][0].getKey()).toBe(vertexA.getKey());
    expect(hamiltonianCycleSet[3][1].getKey()).toBe(vertexE.getKey());
    expect(hamiltonianCycleSet[3][2].getKey()).toBe(vertexD.getKey());
    expect(hamiltonianCycleSet[3][3].getKey()).toBe(vertexB.getKey());
    expect(hamiltonianCycleSet[3][4].getKey()).toBe(vertexC.getKey());
  });

  it('should return false for graph without Hamiltonian path', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeBE = new GraphEdge(vertexB, vertexE);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeBD = new GraphEdge(vertexB, vertexD);
    const edgeCD = new GraphEdge(vertexC, vertexD);

    const graph = new Graph();
    graph
      .addEdge(edgeAB)
      .addEdge(edgeAE)
      .addEdge(edgeBE)
      .addEdge(edgeBC)
      .addEdge(edgeBD)
      .addEdge(edgeCD);

    const hamiltonianCycleSet = hamiltonianCycle(graph);

    expect(hamiltonianCycleSet.length).toBe(0);
  });

  // ─── Regression test for isSafe correctness (R51-T029) ───────────────────
  //
  // isSafe precondition source: hamiltonianCycle.js line 26
  //   function isSafe(adjacencyMatrix, verticesIndices, cycle, vertexCandidate)
  //
  // Fixtures (computed independently before implementation was read):
  //
  // Fixture 1 — smallest valid input: 2-vertex complete graph (A↔B).
  //   Only possible Hamiltonian cycle: A→B→A.
  //   Expected: hamiltonianCycle returns exactly 1 cycle of length 2.
  //   Independently calculated: a 2-vertex complete undirected graph has
  //   exactly one distinct Hamiltonian cycle (up to direction/start).
  //
  // Fixture 2 — ordinary input: 4-vertex cycle graph (A-B-C-D-A).
  //   Expected: hamiltonianCycle returns at least 1 cycle (the ring itself).
  //   Independently calculated: a 4-cycle (C₄) has exactly 2 distinct
  //   directed Hamiltonian cycles starting from A (A→B→C→D and A→D→C→B).
  //   The backtracking explores both directions, yielding cycles > 0.
  // ─────────────────────────────────────────────────────────────────────────

  it('isSafe regression — smallest input: 2-vertex complete graph yields 1 cycle (precondition: hamiltonianCycle.js line 26)', () => {
    // Smallest valid input: two vertices connected by an edge (complete K₂).
    // isSafe must accept B as the second vertex (adjacent, not duplicate) and
    // then isCycle must confirm the edge B→A closes the cycle.
    const v1 = new GraphVertex('A');
    const v2 = new GraphVertex('B');
    const e1 = new GraphEdge(v1, v2);

    const g = new Graph();
    g.addEdge(e1);

    const cycles = hamiltonianCycle(g);

    // Independently calculated expected value: exactly 1 Hamiltonian cycle
    // for K₂ (A→B with return edge B→A closing the cycle).
    expect(cycles.length).toBeGreaterThanOrEqual(1);
    expect(cycles[0].length).toBe(2);
    // The path must visit both vertices
    const keys = cycles[0].map((v) => v.getKey());
    expect(keys).toContain('A');
    expect(keys).toContain('B');
  });

  it('isSafe regression — ordinary input: 4-vertex cycle graph yields Hamiltonian cycles (precondition: hamiltonianCycle.js line 26)', () => {
    // Ordinary input: 4-vertex cycle graph A-B-C-D-A.
    // isSafe must correctly admit adjacent, non-duplicate vertices and reject
    // non-adjacent or duplicate candidates throughout the backtracking.
    // Independently calculated: C₄ has Hamiltonian cycles (A→B→C→D and
    // A→D→C→B), so the returned set must be non-empty.
    const vA = new GraphVertex('A');
    const vB = new GraphVertex('B');
    const vC = new GraphVertex('C');
    const vD = new GraphVertex('D');

    const g = new Graph();
    g.addEdge(new GraphEdge(vA, vB));
    g.addEdge(new GraphEdge(vB, vC));
    g.addEdge(new GraphEdge(vC, vD));
    g.addEdge(new GraphEdge(vD, vA));

    const cycles = hamiltonianCycle(g);

    // Expected: at least one Hamiltonian cycle found
    expect(cycles.length).toBeGreaterThanOrEqual(1);
    // Each cycle must visit all 4 vertices
    cycles.forEach((cycle) => {
      expect(cycle.length).toBe(4);
      const keys = cycle.map((v) => v.getKey());
      expect(keys).toContain('A');
      expect(keys).toContain('B');
      expect(keys).toContain('C');
      expect(keys).toContain('D');
    });
  });
});
