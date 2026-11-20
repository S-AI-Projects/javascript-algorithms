import Queue from '../../../data-structures/queue/Queue';

/**
 * @typedef {Object} Callbacks
 *
 * @property {function(vertices: Object): boolean} [allowTraversal] -
 *   Determines whether DFS should traverse from the vertex to its neighbor
 *   (along the edge). By default prohibits visiting the same vertex again.
 *
 * @property {function(vertices: Object)} [enterVertex] - Called when BFS enters the vertex.
 *
 * @property {function(vertices: Object)} [leaveVertex] - Called when BFS leaves the vertex.
 */

/**
 * Initializes and completes the BFS callbacks object, establishing defaults for omitted handlers.
 *
 * Boundary Specification & Contract:
 * - Source contract: initCallbacks(callbacks = {}) near line 32.
 * - Valid boundary (omitted / undefined): default parameter `{}` applies; defaults are attached.
 * - Valid boundary (empty object `{}`): returns object populated with default handlers.
 * - Valid boundary (partial handlers): any omitted handler is defaulted to its stub or seen-guard.
 * - Valid interior: caller supplies custom allowTraversal, enterVertex, and/or leaveVertex.
 * - Unsupported boundary (null / primitive): native property assignment throws TypeError without
 *   imposing arbitrary custom error policies.
 *
 * Boundary Partition Table:
 * | Partition | Input (callbacks) | Expected Behavior / Contract |
 * |---|---|---|
 * | Valid boundary (omitted) | undefined | Returns Callbacks with default handlers |
 * | Valid boundary (empty) | {} | Returns Callbacks with default handlers |
 * | Valid boundary (partial) | { enterVertex } | Default handlers attached for omitted keys |
 * | Valid interior (full) | { enter, leave, allow } | All custom handlers preserved |
 * | Unsupported boundary | null | Throws native TypeError |
 *
 * @param {Callbacks} [callbacks]
 * @returns {Callbacks}
 */
export function initCallbacks(callbacks = {}) {
  const initiatedCallback = callbacks;

  const stubCallback = () => {};

  const allowTraversalCallback = (
    () => {
      const seen = {};
      return ({ nextVertex }) => {
        if (!seen[nextVertex.getKey()]) {
          seen[nextVertex.getKey()] = true;
          return true;
        }
        return false;
      };
    }
  )();

  initiatedCallback.allowTraversal = callbacks.allowTraversal || allowTraversalCallback;
  initiatedCallback.enterVertex = callbacks.enterVertex || stubCallback;
  initiatedCallback.leaveVertex = callbacks.leaveVertex || stubCallback;

  return initiatedCallback;
}

/**
 * @param {Graph} graph
 * @param {GraphVertex} startVertex
 * @param {Callbacks} [originalCallbacks]
 */
export default function breadthFirstSearch(graph, startVertex, originalCallbacks) {
  const callbacks = initCallbacks(originalCallbacks);
  const vertexQueue = new Queue();

  // Do initial queue setup.
  vertexQueue.enqueue(startVertex);

  let previousVertex = null;

  // Traverse all vertices from the queue.
  while (!vertexQueue.isEmpty()) {
    const currentVertex = vertexQueue.dequeue();
    callbacks.enterVertex({ currentVertex, previousVertex });

    // Add all neighbors to the queue for future traversals.
    graph.getNeighbors(currentVertex).forEach((nextVertex) => {
      if (callbacks.allowTraversal({ previousVertex, currentVertex, nextVertex })) {
        vertexQueue.enqueue(nextVertex);
      }
    });

    callbacks.leaveVertex({ currentVertex, previousVertex });

    // Memorize current vertex before next loop.
    previousVertex = currentVertex;
  }
}
