import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import Graph from '../../../../data-structures/graph/Graph';
import eulerianPath from '../eulerianPath';

describe('eulerianPath', () => {
  it('should throw an error when graph is not Eulerian', () => {
    function findEulerianPathInNotEulerianGraph() {
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const vertexC = new GraphVertex('C');
      const vertexD = new GraphVertex('D');
      const vertexE = new GraphVertex('E');

      const edgeAB = new GraphEdge(vertexA, vertexB);
      const edgeAC = new GraphEdge(vertexA, vertexC);
      const edgeBC = new GraphEdge(vertexB, vertexC);
      const edgeBD = new GraphEdge(vertexB, vertexD);
      const edgeCE = new GraphEdge(vertexC, vertexE);

      const graph = new Graph();

      graph
        .addEdge(edgeAB)
        .addEdge(edgeAC)
        .addEdge(edgeBC)
        .addEdge(edgeBD)
        .addEdge(edgeCE);

      eulerianPath(graph);
    }

    expect(findEulerianPathInNotEulerianGraph).toThrow();
  });

  it('should find Eulerian Circuit in graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeAF = new GraphEdge(vertexA, vertexF);
    const edgeAG = new GraphEdge(vertexA, vertexG);
    const edgeGF = new GraphEdge(vertexG, vertexF);
    const edgeBE = new GraphEdge(vertexB, vertexE);
    const edgeEB = new GraphEdge(vertexE, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeED = new GraphEdge(vertexE, vertexD);
    const edgeCD = new GraphEdge(vertexC, vertexD);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAE)
      .addEdge(edgeAF)
      .addEdge(edgeAG)
      .addEdge(edgeGF)
      .addEdge(edgeBE)
      .addEdge(edgeEB)
      .addEdge(edgeBC)
      .addEdge(edgeED)
      .addEdge(edgeCD);

    const graphEdgesCount = graph.getAllEdges().length;

    const eulerianPathSet = eulerianPath(graph);

    expect(eulerianPathSet.length).toBe(graphEdgesCount + 1);

    expect(eulerianPathSet[0].getKey()).toBe(vertexA.getKey());
    expect(eulerianPathSet[1].getKey()).toBe(vertexB.getKey());
    expect(eulerianPathSet[2].getKey()).toBe(vertexE.getKey());
    expect(eulerianPathSet[3].getKey()).toBe(vertexB.getKey());
    expect(eulerianPathSet[4].getKey()).toBe(vertexC.getKey());
    expect(eulerianPathSet[5].getKey()).toBe(vertexD.getKey());
    expect(eulerianPathSet[6].getKey()).toBe(vertexE.getKey());
    expect(eulerianPathSet[7].getKey()).toBe(vertexA.getKey());
    expect(eulerianPathSet[8].getKey()).toBe(vertexF.getKey());
    expect(eulerianPathSet[9].getKey()).toBe(vertexG.getKey());
    expect(eulerianPathSet[10].getKey()).toBe(vertexA.getKey());
  });

  it('should find Eulerian Path in graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');
    const vertexH = new GraphVertex('H');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeAC = new GraphEdge(vertexA, vertexC);
    const edgeBD = new GraphEdge(vertexB, vertexD);
    const edgeDC = new GraphEdge(vertexD, vertexC);
    const edgeCE = new GraphEdge(vertexC, vertexE);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeFH = new GraphEdge(vertexF, vertexH);
    const edgeFG = new GraphEdge(vertexF, vertexG);
    const edgeHG = new GraphEdge(vertexH, vertexG);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAC)
      .addEdge(edgeBD)
      .addEdge(edgeDC)
      .addEdge(edgeCE)
      .addEdge(edgeEF)
      .addEdge(edgeFH)
      .addEdge(edgeFG)
      .addEdge(edgeHG);

    const graphEdgesCount = graph.getAllEdges().length;

    const eulerianPathSet = eulerianPath(graph);

    expect(eulerianPathSet.length).toBe(graphEdgesCount + 1);

    expect(eulerianPathSet[0].getKey()).toBe(vertexC.getKey());
    expect(eulerianPathSet[1].getKey()).toBe(vertexA.getKey());
    expect(eulerianPathSet[2].getKey()).toBe(vertexB.getKey());
    expect(eulerianPathSet[3].getKey()).toBe(vertexD.getKey());
    expect(eulerianPathSet[4].getKey()).toBe(vertexC.getKey());
    expect(eulerianPathSet[5].getKey()).toBe(vertexE.getKey());
    expect(eulerianPathSet[6].getKey()).toBe(vertexF.getKey());
    expect(eulerianPathSet[7].getKey()).toBe(vertexH.getKey());
    expect(eulerianPathSet[8].getKey()).toBe(vertexG.getKey());
    expect(eulerianPathSet[9].getKey()).toBe(vertexF.getKey());
  });

  describe('contract regression tests (R51-T001)', () => {
    it('smallest valid input: 2 vertices with 1 edge (preconditions: lines 24, 36, 41)', () => {
      // Smallest valid input fixture
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const edgeAB = new GraphEdge(vertexA, vertexB);

      const graph = new Graph();
      graph.addEdge(edgeAB);

      // Verify precondition state before execution
      expect(graph.getAllVertices().length).toBe(2);
      expect(graph.getAllEdges().length).toBe(1);

      // Independent expected output: ['A', 'B']
      const path = eulerianPath(graph);
      const pathKeys = path.map((vertex) => vertex.getKey());
      expect(pathKeys).toEqual(['A', 'B']);

      // Test observable mutation separately: all traversed edges deleted (line 112)
      expect(graph.getAllEdges().length).toBe(0);
    });

    it('ordinary input: 4 vertices connected in a linear path A-B-C-D', () => {
      // Ordinary input fixture: two odd-degree endpoints (A, D) and intermediaries (B, C)
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

      expect(graph.getAllEdges().length).toBe(3);

      // Independent expected output: traversal visits edges in order A -> B -> C -> D
      const path = eulerianPath(graph);
      const pathKeys = path.map((vertex) => vertex.getKey());
      expect(pathKeys).toEqual(['A', 'B', 'C', 'D']);

      // Test observable mutation separately: all traversed edges deleted (line 112)
      expect(graph.getAllEdges().length).toBe(0);
    });

    it('domain boundary: triangle cycle A-B-C-A with repeated vertex', () => {
      // Domain boundary fixture: circuit where all vertices have even degree 2
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const vertexC = new GraphVertex('C');

      const edgeAB = new GraphEdge(vertexA, vertexB);
      const edgeBC = new GraphEdge(vertexB, vertexC);
      const edgeCA = new GraphEdge(vertexC, vertexA);

      const graph = new Graph();
      graph
        .addEdge(edgeAB)
        .addEdge(edgeBC)
        .addEdge(edgeCA);

      expect(graph.getAllEdges().length).toBe(3);

      // Independent expected output: circuit starts and ends at vertex A
      const path = eulerianPath(graph);
      const pathKeys = path.map((vertex) => vertex.getKey());
      expect(pathKeys).toEqual(['A', 'B', 'C', 'A']);

      // Repeated value boundary check
      expect(pathKeys[0]).toBe(pathKeys[pathKeys.length - 1]);

      // Test observable mutation separately: all traversed edges deleted (line 112)
      expect(graph.getAllEdges().length).toBe(0);
    });
  });
});
