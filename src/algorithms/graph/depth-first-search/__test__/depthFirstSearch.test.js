import Graph from '../../../../data-structures/graph/Graph';
import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import depthFirstSearch from '../depthFirstSearch';

describe('depthFirstSearch', () => {
  it('should perform DFS operation on graph', () => {
    const graph = new Graph(true);

    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCG = new GraphEdge(vertexC, vertexG);
    const edgeAD = new GraphEdge(vertexA, vertexD);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeFD = new GraphEdge(vertexF, vertexD);
    const edgeDG = new GraphEdge(vertexD, vertexG);

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDG);

    expect(graph.toString()).toBe('A,B,C,G,D,E,F');

    const enterVertexCallback = jest.fn();
    const leaveVertexCallback = jest.fn();

    // Traverse graphs without callbacks first to check default ones.
    depthFirstSearch(graph, vertexA);

    // Traverse graph with enterVertex and leaveVertex callbacks.
    depthFirstSearch(graph, vertexA, {
      enterVertex: enterVertexCallback,
      leaveVertex: leaveVertexCallback,
    });

    expect(enterVertexCallback).toHaveBeenCalledTimes(graph.getAllVertices().length);
    expect(leaveVertexCallback).toHaveBeenCalledTimes(graph.getAllVertices().length);

    const enterVertexParamsMap = [
      { currentVertex: vertexA, previousVertex: null },
      { currentVertex: vertexB, previousVertex: vertexA },
      { currentVertex: vertexC, previousVertex: vertexB },
      { currentVertex: vertexG, previousVertex: vertexC },
      { currentVertex: vertexD, previousVertex: vertexA },
      { currentVertex: vertexE, previousVertex: vertexA },
      { currentVertex: vertexF, previousVertex: vertexE },
    ];

    for (let callIndex = 0; callIndex < graph.getAllVertices().length; callIndex += 1) {
      const params = enterVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(enterVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(enterVertexParamsMap[callIndex].previousVertex);
    }

    const leaveVertexParamsMap = [
      { currentVertex: vertexG, previousVertex: vertexC },
      { currentVertex: vertexC, previousVertex: vertexB },
      { currentVertex: vertexB, previousVertex: vertexA },
      { currentVertex: vertexD, previousVertex: vertexA },
      { currentVertex: vertexF, previousVertex: vertexE },
      { currentVertex: vertexE, previousVertex: vertexA },
      { currentVertex: vertexA, previousVertex: null },
    ];

    for (let callIndex = 0; callIndex < graph.getAllVertices().length; callIndex += 1) {
      const params = leaveVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(leaveVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(leaveVertexParamsMap[callIndex].previousVertex);
    }
  });

  it('allow users to redefine vertex visiting logic', () => {
    const graph = new Graph(true);

    const vertexA = new GraphVertex('A');
    const vertexB = new GraphVertex('B');
    const vertexC = new GraphVertex('C');
    const vertexD = new GraphVertex('D');
    const vertexE = new GraphVertex('E');
    const vertexF = new GraphVertex('F');
    const vertexG = new GraphVertex('G');

    const edgeAB = new GraphEdge(vertexA, vertexB);
    const edgeBC = new GraphEdge(vertexB, vertexC);
    const edgeCG = new GraphEdge(vertexC, vertexG);
    const edgeAD = new GraphEdge(vertexA, vertexD);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeFD = new GraphEdge(vertexF, vertexD);
    const edgeDG = new GraphEdge(vertexD, vertexG);

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDG);

    expect(graph.toString()).toBe('A,B,C,G,D,E,F');

    const enterVertexCallback = jest.fn();
    const leaveVertexCallback = jest.fn();

    depthFirstSearch(graph, vertexA, {
      enterVertex: enterVertexCallback,
      leaveVertex: leaveVertexCallback,
      allowTraversal: ({ currentVertex, nextVertex }) => {
        return !(currentVertex === vertexA && nextVertex === vertexB);
      },
    });

    expect(enterVertexCallback).toHaveBeenCalledTimes(7);
    expect(leaveVertexCallback).toHaveBeenCalledTimes(7);

    const enterVertexParamsMap = [
      { currentVertex: vertexA, previousVertex: null },
      { currentVertex: vertexD, previousVertex: vertexA },
      { currentVertex: vertexG, previousVertex: vertexD },
      { currentVertex: vertexE, previousVertex: vertexA },
      { currentVertex: vertexF, previousVertex: vertexE },
      { currentVertex: vertexD, previousVertex: vertexF },
      { currentVertex: vertexG, previousVertex: vertexD },
    ];

    for (let callIndex = 0; callIndex < graph.getAllVertices().length; callIndex += 1) {
      const params = enterVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(enterVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(enterVertexParamsMap[callIndex].previousVertex);
    }

    const leaveVertexParamsMap = [
      { currentVertex: vertexG, previousVertex: vertexD },
      { currentVertex: vertexD, previousVertex: vertexA },
      { currentVertex: vertexG, previousVertex: vertexD },
      { currentVertex: vertexD, previousVertex: vertexF },
      { currentVertex: vertexF, previousVertex: vertexE },
      { currentVertex: vertexE, previousVertex: vertexA },
      { currentVertex: vertexA, previousVertex: null },
    ];

    for (let callIndex = 0; callIndex < graph.getAllVertices().length; callIndex += 1) {
      const params = leaveVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(leaveVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(leaveVertexParamsMap[callIndex].previousVertex);
    }
  });

  // ─── initCallbacks fallback and cycle-rejection tests (R51-T028) ─────────
  //
  // Source contract: depthFirstSearch.js lines 33-56 (initCallbacks)
  // Tested branches:
  //   - Line 51: fallback to default allowTraversalCallback when omitted
  //   - Line 46: return false; rejection branch when cycle revisits seen vertex
  //   - Line 52-53: fallback to stubCallback when enterVertex/leaveVertex omitted
  //
  // Fixture:
  //   Directed graph with cycle A -> B -> C -> A and isolated vertex D.
  //   Starting at A: DFS must visit A, B, C; cycle C -> A must be rejected
  //   by line 46 (returning false); traversal terminates without visiting D.
  // ─────────────────────────────────────────────────────────────────────────

  describe('initCallbacks fallback and absent-result cycle termination', () => {
    it('exercises cycle-rejection branch (line 46) and terminates without visiting isolated D', () => {
      const graph = new Graph(true);

      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      const vertexC = new GraphVertex('C');
      const vertexD = new GraphVertex('D'); // isolated vertex

      const edgeAB = new GraphEdge(vertexA, vertexB);
      const edgeBC = new GraphEdge(vertexB, vertexC);
      const edgeCA = new GraphEdge(vertexC, vertexA);

      graph
        .addEdge(edgeAB)
        .addEdge(edgeBC)
        .addEdge(edgeCA)
        .addVertex(vertexD);

      const entered = [];
      const left = [];

      // Caller-owned state passed to callbacks
      const callerState = {
        appId: 'test-dfs-run',
        runCount: 1,
        enterVertex: ({ currentVertex }) => {
          entered.push(currentVertex.getKey());
        },
        leaveVertex: ({ currentVertex }) => {
          left.push(currentVertex.getKey());
        },
        // Note: allowTraversal is intentionally omitted to exercise the
        // initCallbacks fallback branch (line 51) and rejection branch (line 46)
      };

      // 1. Run DFS starting at vertex A on cycle graph with isolated D
      depthFirstSearch(graph, vertexA, callerState);

      // Traversal visits cycle A -> B -> C -> A and terminates at A -> B via rejection branch
      expect(entered).toEqual(['A', 'B', 'C', 'A']);
      expect(left).toEqual(['A', 'C', 'B', 'A']);

      // Assert that cycle terminated without visiting isolated vertex D
      expect(entered.includes('D')).toBe(false);
      expect(left.includes('D')).toBe(false);

      // 2. Verify caller-owned state remains valid after the cycle rejection
      expect(callerState.appId).toBe('test-dfs-run');
      expect(callerState.runCount).toBe(1);
      expect(typeof callerState.allowTraversal).toBe('function');

      // 3. Include a successful call after the rejection:
      // Starting from isolated vertex D should succeed independently
      const enteredAfter = [];
      depthFirstSearch(graph, vertexD, {
        enterVertex: ({ currentVertex }) => {
          enteredAfter.push(currentVertex.getKey());
        },
      });

      expect(enteredAfter).toEqual(['D']);
    });

    it('exercises total contract of initCallbacks with omitted / empty callbacks (lines 51-53)', () => {
      const graph = new Graph(true);
      const vertexA = new GraphVertex('A');
      const vertexB = new GraphVertex('B');
      graph.addEdge(new GraphEdge(vertexA, vertexB));

      // Call DFS with completely omitted callbacks (relies on default parameter line 33)
      expect(() => depthFirstSearch(graph, vertexA)).not.toThrow();

      // Subsequent ordinary call still succeeds
      const visited = [];
      depthFirstSearch(graph, vertexA, {
        enterVertex: ({ currentVertex }) => visited.push(currentVertex.getKey()),
      });
      expect(visited).toEqual(['A', 'B']);
    });
  });
});
