import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import Graph from '../../../../data-structures/graph/Graph';
import kruskal from '../kruskal';

describe('kruskal', () => {
  it('should fire an error for directed graph', () => {
    function applyPrimToDirectedGraph() {
      const graph = new Graph(true);

      kruskal(graph);
    }

    expect(applyPrimToDirectedGraph).toThrow();
  });

  it('should find minimum spanning tree', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');

    const edgeAB = new GraphEdge(vertexA, vertexB, 2);
    const edgeAD = new GraphEdge(vertexA, vertexD, 3);
    const edgeAC = new GraphEdge(vertexA, vertexC, 3);
    const edgeBC = new GraphEdge(vertexB, vertexC, 4);
    const edgeBE = new GraphEdge(vertexB, vertexE, 3);
    const edgeDF = new GraphEdge(vertexD, vertexF, 7);
    const edgeEC = new GraphEdge(vertexE, vertexC, 1);
    const edgeEF = new GraphEdge(vertexE, vertexF, 8);
    const edgeFG = new GraphEdge(vertexF, vertexG, 9);
    const edgeFC = new GraphEdge(vertexF, vertexC, 6);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAD)
      .addEdge(edgeAC)
      .addEdge(edgeBC)
      .addEdge(edgeBE)
      .addEdge(edgeDF)
      .addEdge(edgeEC)
      .addEdge(edgeEF)
      .addEdge(edgeFC)
      .addEdge(edgeFG);

    expect(graph.getWeight()).toEqual(46);

    const minimumSpanningTree = kruskal(graph);

    expect(minimumSpanningTree.getWeight()).toBe(24);
    expect(minimumSpanningTree.getAllVertices().length).toBe(graph.getAllVertices().length);
    expect(minimumSpanningTree.getAllEdges().length).toBe(graph.getAllVertices().length - 1);
    expect(minimumSpanningTree.toString()).toBe('E,C,A,B,D,F,G');
  });

  it('should find minimum spanning tree for simple graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');

    const edgeAB = new GraphEdge(vertexA, vertexB, 1);
    const edgeAD = new GraphEdge(vertexA, vertexD, 3);
    const edgeBC = new GraphEdge(vertexB, vertexC, 1);
    const edgeBD = new GraphEdge(vertexB, vertexD, 3);
    const edgeCD = new GraphEdge(vertexC, vertexD, 1);

    const graph = new Graph();

    graph
      .addEdge(edgeAB)
      .addEdge(edgeAD)
      .addEdge(edgeBC)
      .addEdge(edgeBD)
      .addEdge(edgeCD);

    expect(graph.getWeight()).toEqual(9);

    const minimumSpanningTree = kruskal(graph);

    expect(minimumSpanningTree.getWeight()).toBe(3);
    expect(minimumSpanningTree.getAllVertices().length).toBe(graph.getAllVertices().length);
    expect(minimumSpanningTree.getAllEdges().length).toBe(graph.getAllVertices().length - 1);
    expect(minimumSpanningTree.toString()).toBe('A,B,C,D');
  });

  describe('failure-path coverage and boundary fixtures (R51-T008)', () => {
    it('smallest valid input: 2 vertices with 1 edge (preconditions: lines 24, 42)', () => {
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const edgeAB = new GraphEdge(vertexA, vertexB, 5);

      const graph = new Graph();
      graph.addEdge(edgeAB);

      const mst = kruskal(graph);
      expect(mst.getWeight()).toBe(5);
      expect(mst.getAllEdges().length).toBe(1);
      expect(mst.getAllVertices().length).toBe(2);
    });

    it('ordinary input: triangle graph (preconditions: lines 24, 42)', () => {
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const vertexC = new GraphVertex('C');

      const edgeAB = new GraphEdge(vertexA, vertexB, 1);
      const edgeBC = new GraphEdge(vertexB, vertexC, 2);
      const edgeCA = new GraphEdge(vertexC, vertexA, 3);

      const graph = new Graph();
      graph
        .addEdge(edgeAB)
        .addEdge(edgeBC)
        .addEdge(edgeCA);

      const mst = kruskal(graph);
      // Independent expected output: edges with weights 1 and 2 are selected; weight = 3
      expect(mst.getWeight()).toBe(3);
      expect(mst.getAllEdges().length).toBe(2);
    });

    it('failure branch (lines 23-25): rejects directed graph and preserves caller state', () => {
      // Smallest input reaching failure branch
      const directedGraph = new Graph(true);
      const vertexA = new GraphVertex('A');
      directedGraph.addVertex(vertexA);

      // Assert exact exception
      expect(() => kruskal(directedGraph)).toThrow(
        "Kruskal's algorithms works only for undirected graphs",
      );

      // Verify caller state preserved
      expect(directedGraph.isDirected).toBe(true);
      expect(directedGraph.getAllVertices().length).toBe(1);

      // Verify subsequent valid call succeeds after failure
      const validGraph = new Graph();
      const vertexX = new GraphVertex('X');
      const vertexY = new GraphVertex('Y');
      validGraph.addEdge(new GraphEdge(vertexX, vertexY, 10));

      const mst = kruskal(validGraph);
      expect(mst.getWeight()).toBe(10);
      expect(mst.getAllEdges().length).toBe(1);
    });

    it('empty result branch: graph with no edges produces empty spanning tree', () => {
      const emptyGraph = new Graph();
      const mst = kruskal(emptyGraph);
      expect(mst.getAllEdges().length).toBe(0);
      expect(mst.getWeight()).toBe(0);
    });
  });
});
