import Graph from '../../../../data-structures/graph/Graph';
import GraphVertex from '../../../../data-structures/graph/GraphVertex';
import GraphEdge from '../../../../data-structures/graph/GraphEdge';
import breadthFirstSearch, { initCallbacks } from '../breadthFirstSearch';

describe('breadthFirstSearch', () => {
  it('should perform BFS operation on graph', () => {
    const graph = new Graph(true);

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
    const edgeCG = new GraphEdge(vertexC, vertexG);
    const edgeAD = new GraphEdge(vertexA, vertexD);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeFD = new GraphEdge(vertexF, vertexD);
    const edgeDH = new GraphEdge(vertexD, vertexH);
    const edgeGH = new GraphEdge(vertexG, vertexH);

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDH)
      .addEdge(edgeGH);

    expect(graph.toString()).toBe('A,B,C,G,D,E,F,H');

    const enterVertexCallback = jest.fn();
    const leaveVertexCallback = jest.fn();

    // Traverse graphs without callbacks first.
    breadthFirstSearch(graph, vertexA);

    // Traverse graph with enterVertex and leaveVertex callbacks.
    breadthFirstSearch(graph, vertexA, {
      enterVertex: enterVertexCallback,
      leaveVertex: leaveVertexCallback,
    });

    expect(enterVertexCallback).toHaveBeenCalledTimes(8);
    expect(leaveVertexCallback).toHaveBeenCalledTimes(8);

    const enterVertexParamsMap = [
      { currentVertex: vertexA, previousVertex: null },
      { currentVertex: vertexB, previousVertex: vertexA },
      { currentVertex: vertexD, previousVertex: vertexB },
      { currentVertex: vertexE, previousVertex: vertexD },
      { currentVertex: vertexC, previousVertex: vertexE },
      { currentVertex: vertexH, previousVertex: vertexC },
      { currentVertex: vertexF, previousVertex: vertexH },
      { currentVertex: vertexG, previousVertex: vertexF },
    ];

    for (let callIndex = 0; callIndex < graph.getAllVertices().length; callIndex += 1) {
      const params = enterVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(enterVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(enterVertexParamsMap[callIndex].previousVertex);
    }

    const leaveVertexParamsMap = [
      { currentVertex: vertexA, previousVertex: null },
      { currentVertex: vertexB, previousVertex: vertexA },
      { currentVertex: vertexD, previousVertex: vertexB },
      { currentVertex: vertexE, previousVertex: vertexD },
      { currentVertex: vertexC, previousVertex: vertexE },
      { currentVertex: vertexH, previousVertex: vertexC },
      { currentVertex: vertexF, previousVertex: vertexH },
      { currentVertex: vertexG, previousVertex: vertexF },
    ];

    for (let callIndex = 0; callIndex < graph.getAllVertices().length; callIndex += 1) {
      const params = leaveVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(leaveVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(leaveVertexParamsMap[callIndex].previousVertex);
    }
  });

  it('should allow to create custom vertex visiting logic', () => {
    const graph = new Graph(true);

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
    const edgeCG = new GraphEdge(vertexC, vertexG);
    const edgeAD = new GraphEdge(vertexA, vertexD);
    const edgeAE = new GraphEdge(vertexA, vertexE);
    const edgeEF = new GraphEdge(vertexE, vertexF);
    const edgeFD = new GraphEdge(vertexF, vertexD);
    const edgeDH = new GraphEdge(vertexD, vertexH);
    const edgeGH = new GraphEdge(vertexG, vertexH);

    graph
      .addEdge(edgeAB)
      .addEdge(edgeBC)
      .addEdge(edgeCG)
      .addEdge(edgeAD)
      .addEdge(edgeAE)
      .addEdge(edgeEF)
      .addEdge(edgeFD)
      .addEdge(edgeDH)
      .addEdge(edgeGH);

    expect(graph.toString()).toBe('A,B,C,G,D,E,F,H');

    const enterVertexCallback = jest.fn();
    const leaveVertexCallback = jest.fn();

    // Traverse graph with enterVertex and leaveVertex callbacks.
    breadthFirstSearch(graph, vertexA, {
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
      { currentVertex: vertexE, previousVertex: vertexD },
      { currentVertex: vertexH, previousVertex: vertexE },
      { currentVertex: vertexF, previousVertex: vertexH },
      { currentVertex: vertexD, previousVertex: vertexF },
      { currentVertex: vertexH, previousVertex: vertexD },
    ];

    for (let callIndex = 0; callIndex < 7; callIndex += 1) {
      const params = enterVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(enterVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(enterVertexParamsMap[callIndex].previousVertex);
    }

    const leaveVertexParamsMap = [
      { currentVertex: vertexA, previousVertex: null },
      { currentVertex: vertexD, previousVertex: vertexA },
      { currentVertex: vertexE, previousVertex: vertexD },
      { currentVertex: vertexH, previousVertex: vertexE },
      { currentVertex: vertexF, previousVertex: vertexH },
      { currentVertex: vertexD, previousVertex: vertexF },
      { currentVertex: vertexH, previousVertex: vertexD },
    ];

    for (let callIndex = 0; callIndex < 7; callIndex += 1) {
      const params = leaveVertexCallback.mock.calls[callIndex][0];
      expect(params.currentVertex).toEqual(leaveVertexParamsMap[callIndex].currentVertex);
      expect(params.previousVertex).toEqual(leaveVertexParamsMap[callIndex].previousVertex);
    }
  });

  describe('initCallbacks boundary cases and stated reachability fixture (R51-T042)', () => {
    describe('stated reachability fixture (edges A-B, A-C, B-D, isolated E)', () => {
      it('verifies distances from A: 0 to A, 1 to B/C, 2 to D, with E unreachable (undirected)', () => {
        const graph = new Graph();

        const vertexA = new GraphVertex('A');
        const vertexB = new GraphVertex('B');
        const vertexC = new GraphVertex('C');
        const vertexD = new GraphVertex('D');
        const vertexE = new GraphVertex('E'); // isolated vertex

        const edgeAB = new GraphEdge(vertexA, vertexB);
        const edgeAC = new GraphEdge(vertexA, vertexC);
        const edgeBD = new GraphEdge(vertexB, vertexD);

        graph
          .addEdge(edgeAB)
          .addEdge(edgeAC)
          .addEdge(edgeBD)
          .addVertex(vertexE);

        const entered = [];
        const left = [];
        const distances = { [vertexA.getKey()]: 0 };
        const seen = { [vertexA.getKey()]: true };

        breadthFirstSearch(graph, vertexA, {
          enterVertex: ({ currentVertex }) => {
            entered.push(currentVertex.getKey());
          },
          leaveVertex: ({ currentVertex }) => {
            left.push(currentVertex.getKey());
          },
          allowTraversal: ({ currentVertex, nextVertex }) => {
            if (!seen[nextVertex.getKey()]) {
              seen[nextVertex.getKey()] = true;
              distances[nextVertex.getKey()] = distances[currentVertex.getKey()] + 1;
              return true;
            }
            return false;
          },
        });

        // Distances from A: 0 to A, 1 to B/C, 2 to D, E unreachable
        expect(distances.A).toBe(0);
        expect(distances.B).toBe(1);
        expect(distances.C).toBe(1);
        expect(distances.D).toBe(2);
        expect(distances.E).toBeUndefined();

        // Reachability
        expect(entered).toEqual(['A', 'B', 'C', 'D']);
        expect(left).toEqual(['A', 'B', 'C', 'D']);
        expect(entered.includes('E')).toBe(false);
        expect(left.includes('E')).toBe(false);
      });

      it('verifies distances from A: 0 to A, 1 to B/C, 2 to D, with E unreachable (directed)', () => {
        const graph = new Graph(true);

        const vertexA = new GraphVertex('A');
        const vertexB = new GraphVertex('B');
        const vertexC = new GraphVertex('C');
        const vertexD = new GraphVertex('D');
        const vertexE = new GraphVertex('E'); // isolated vertex

        const edgeAB = new GraphEdge(vertexA, vertexB);
        const edgeAC = new GraphEdge(vertexA, vertexC);
        const edgeBD = new GraphEdge(vertexB, vertexD);

        graph
          .addEdge(edgeAB)
          .addEdge(edgeAC)
          .addEdge(edgeBD)
          .addVertex(vertexE);

        const entered = [];
        const distances = { [vertexA.getKey()]: 0 };
        const seen = { [vertexA.getKey()]: true };

        breadthFirstSearch(graph, vertexA, {
          enterVertex: ({ currentVertex }) => {
            entered.push(currentVertex.getKey());
          },
          allowTraversal: ({ currentVertex, nextVertex }) => {
            if (!seen[nextVertex.getKey()]) {
              seen[nextVertex.getKey()] = true;
              distances[nextVertex.getKey()] = distances[currentVertex.getKey()] + 1;
              return true;
            }
            return false;
          },
        });

        expect(distances.A).toBe(0);
        expect(distances.B).toBe(1);
        expect(distances.C).toBe(1);
        expect(distances.D).toBe(2);
        expect(distances.E).toBeUndefined();
        expect(entered.includes('E')).toBe(false);
      });
    });

    describe('initCallbacks boundary partitions', () => {
      it('supports omitted callbacks argument (valid boundary: undefined)', () => {
        // Direct initCallbacks call with omitted argument
        const callbacks = initCallbacks();
        expect(typeof callbacks.allowTraversal).toBe('function');
        expect(typeof callbacks.enterVertex).toBe('function');
        expect(typeof callbacks.leaveVertex).toBe('function');

        // Verify default allowTraversal seen-guard behavior
        const dummyVertex1 = new GraphVertex('X');
        const dummyVertex2 = new GraphVertex('Y');
        expect(callbacks.allowTraversal({ nextVertex: dummyVertex1 })).toBe(true);
        expect(callbacks.allowTraversal({ nextVertex: dummyVertex1 })).toBe(false);
        expect(callbacks.allowTraversal({ nextVertex: dummyVertex2 })).toBe(true);

        // Verify default stubs do not throw
        expect(() => callbacks.enterVertex({ currentVertex: dummyVertex1 })).not.toThrow();
        expect(() => callbacks.leaveVertex({ currentVertex: dummyVertex1 })).not.toThrow();
      });

      it('supports explicit empty object (valid boundary: {})', () => {
        const callbacks = initCallbacks({});
        expect(typeof callbacks.allowTraversal).toBe('function');
        expect(typeof callbacks.enterVertex).toBe('function');
        expect(typeof callbacks.leaveVertex).toBe('function');

        const dummyVertex = new GraphVertex('Z');
        expect(callbacks.allowTraversal({ nextVertex: dummyVertex })).toBe(true);
        expect(callbacks.allowTraversal({ nextVertex: dummyVertex })).toBe(false);
      });

      it('supports partial callbacks by defaulting omitted handlers', () => {
        const customEnter = jest.fn();
        const callbacks = initCallbacks({ enterVertex: customEnter });

        expect(callbacks.enterVertex).toBe(customEnter);
        expect(typeof callbacks.allowTraversal).toBe('function');
        expect(typeof callbacks.leaveVertex).toBe('function');

        const dummyVertex = new GraphVertex('W');
        callbacks.enterVertex({ currentVertex: dummyVertex });
        expect(customEnter).toHaveBeenCalledWith({ currentVertex: dummyVertex });
      });

      it('preserves all handlers in valid interior (full callbacks)', () => {
        const customAllow = () => true;
        const customEnter = () => {};
        const customLeave = () => {};

        const callbacks = initCallbacks({
          allowTraversal: customAllow,
          enterVertex: customEnter,
          leaveVertex: customLeave,
        });

        expect(callbacks.allowTraversal).toBe(customAllow);
        expect(callbacks.enterVertex).toBe(customEnter);
        expect(callbacks.leaveVertex).toBe(customLeave);
      });

      it('throws TypeError for null / non-object input (unsupported boundary)', () => {
        // Native property write onto null throws TypeError
        expect(() => initCallbacks(null)).toThrow(TypeError);

        const graph = new Graph();
        const vertexA = new GraphVertex('A');
        graph.addVertex(vertexA);

        expect(() => breadthFirstSearch(graph, vertexA, null)).toThrow(TypeError);
      });

      it('runs BFS end-to-end with omitted callbacks on stated fixture', () => {
        const graph = new Graph();
        const vertexA = new GraphVertex('A');
        const vertexB = new GraphVertex('B');
        graph.addEdge(new GraphEdge(vertexA, vertexB));

        // BFS without callbacks argument must complete without error
        expect(() => breadthFirstSearch(graph, vertexA)).not.toThrow();
      });
    });
  });
});
