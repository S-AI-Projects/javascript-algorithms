import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import Graph from '../../../../data-structures/graph/Graph';
import stronglyConnectedComponents, {
  getVerticesSortedByDfsFinishTime,
} from '../stronglyConnectedComponents';

describe('stronglyConnectedComponents', () => {
  it('should detect strongly connected components in simple graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCA = new GraphEdge(vertexC, vertexA);
    const edgeCD = new GraphEdge(vertexC, vertexD);

    const graph = new Graph(true);

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCA)
      .addEdge(edgeCD);

    const components = stronglyConnectedComponents(graph);

    expect(components).toBeDefined();
    expect(components.length).toBe(2);

    expect(components[0][0].getKey()).toBe(vertexA.getKey());
    expect(components[0][1].getKey()).toBe(vertexC.getKey());
    expect(components[0][2].getKey()).toBe(vertexB.getKey());

    expect(components[1][0].getKey()).toBe(vertexD.getKey());
  });

  it('should detect strongly connected components in graph', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');
    const vertexH = new GraphVertex('H');
    const vertexI = new GraphVertex('I');
    const vertexJ = new GraphVertex('J');
    const vertexK = new GraphVertex('K');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCA = new GraphEdge(vertexC, vertexA);
    const edgeBD = new GraphEdge(vertexB, vertexD);
    const edgeDE = new GraphEdge(vertexD, vertexE);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeFD = new GraphEdge(vertexF, vertexD);
    const edgeGF = new GraphEdge(vertexG, vertexF);
    const edgeGH = new GraphEdge(vertexG, vertexH);
    const edgeHI = new GraphEdge(vertexH, vertexI);
    const edgeIJ = new GraphEdge(vertexI, vertexJ);
    const edgeJG = new GraphEdge(vertexJ, vertexG);
    const edgeJK = new GraphEdge(vertexJ, vertexK);

    const graph = new Graph(true);

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCA)
      .addEdge(edgeBD)
      .addEdge(edgeDE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeGF)
      .addEdge(edgeGH)
      .addEdge(edgeHI)
      .addEdge(edgeIJ)
      .addEdge(edgeJG)
      .addEdge(edgeJK);

    const components = stronglyConnectedComponents(graph);

    expect(components).toBeDefined();
    expect(components.length).toBe(4);

    expect(components[0][0].getKey()).toBe(vertexG.getKey());
    expect(components[0][1].getKey()).toBe(vertexJ.getKey());
    expect(components[0][2].getKey()).toBe(vertexI.getKey());
    expect(components[0][3].getKey()).toBe(vertexH.getKey());

    expect(components[1][0].getKey()).toBe(vertexK.getKey());

    expect(components[2][0].getKey()).toBe(vertexA.getKey());
    expect(components[2][1].getKey()).toBe(vertexC.getKey());
    expect(components[2][2].getKey()).toBe(vertexB.getKey());

    expect(components[3][0].getKey()).toBe(vertexD.getKey());
    expect(components[3][1].getKey()).toBe(vertexF.getKey());
    expect(components[3][2].getKey()).toBe(vertexE.getKey());
  });

  it('should not break on edges in opposite directions (issue #873)', () => {
    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBA = new GraphEdge(vertexB, vertexA);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCA = new GraphEdge(vertexC, vertexA);
    const edgeCD = new GraphEdge(vertexC, vertexD);

    const graph = new Graph(true);
    graph
      .addEdge(edgeAB)
      .addEdge(edgeBA)
      .addEdge(edgeBC)
      .addEdge(edgeCA)
      .addEdge(edgeCD);

    const components = stronglyConnectedComponents(graph);

    expect(components.length).toBe(2);
    expect(components[0].map((vertex) => vertex.getKey()).sort()).toEqual(['A', 'B', 'C']);
    expect(components[1].map((vertex) => vertex.getKey())).toEqual(['D']);
  });
});

describe('getVerticesSortedByDfsFinishTime scaling and correctness fixtures', () => {
  // Source lines in stronglyConnectedComponents.js:
  // - Line 32: getVerticesSortedByDfsFinishTime(graph) function signature
  // - Line 34: array fixture handling (returns stack with descending finish-time order)
  // - Line 53: Graph vertex DFS traversal and finish-time stack generation

  it('correctly processes the smallest supported collection (empty)', () => {
    const emptyArrayResult = getVerticesSortedByDfsFinishTime([]);
    expect(emptyArrayResult.isEmpty()).toBe(true);
    expect(emptyArrayResult.toArray()).toEqual([]);

    const emptyGraph = new Graph(true);
    const emptyGraphResult = getVerticesSortedByDfsFinishTime(emptyGraph);
    expect(emptyGraphResult.isEmpty()).toBe(true);
    expect(emptyGraphResult.toArray()).toEqual([]);
  });

  it('orders fixture [3, 1, 2] descending according to finish-time stack interface', () => {
    const stack = getVerticesSortedByDfsFinishTime([3, 1, 2]);
    expect(stack.toArray()).toEqual([3, 2, 1]);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it('orders fixture [2, 2, 1] descending according to finish-time stack interface', () => {
    const stack = getVerticesSortedByDfsFinishTime([2, 2, 1]);
    expect(stack.toArray()).toEqual([2, 2, 1]);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it('orders already ordered [1, 2, 3] descending according to finish-time stack interface', () => {
    const stack = getVerticesSortedByDfsFinishTime([1, 2, 3]);
    expect(stack.toArray()).toEqual([3, 2, 1]);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it('orders reversed [3, 2, 1] descending according to finish-time stack interface', () => {
    const stack = getVerticesSortedByDfsFinishTime([3, 2, 1]);
    expect(stack.toArray()).toEqual([3, 2, 1]);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it('correctly orders a directed graph fixture by DFS finish time', () => {
    const v1 = new GraphVertex('1');
    const v2 = new GraphVertex('2');
    const v3 = new GraphVertex('3');
    const graph = new Graph(true);
    graph.addEdge(new GraphEdge(v3, v2));
    graph.addEdge(new GraphEdge(v2, v1));

    const stack = getVerticesSortedByDfsFinishTime(graph);
    const keys = stack.toArray().map((v) => v.getKey());
    expect(keys).toEqual(['3', '2', '1']);
  });
});
