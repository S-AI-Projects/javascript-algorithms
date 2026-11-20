/**
 * @typedef {Object} Callbacks
 *
 * @property {function(vertices: Object): boolean} [allowTraversal] -
 *  Determines whether DFS should traverse from the vertex to its neighbor
 *  (along the edge). By default prohibits visiting the same vertex again.
 *
 * @property {function(vertices: Object)} [enterVertex] - Called when DFS enters the vertex.
 *
 * @property {function(vertices: Object)} [leaveVertex] - Called when DFS leaves the vertex.
 */

/**
 * Initializes and completes the DFS callbacks object.
 *
 * Contract & Branching:
 * - Total contract: Never throws on valid object or omitted argument;
 *   returns a populated Callbacks object.
 * - Fallback / Absent-result branches:
 *   - Line 51: `callbacks.allowTraversal || allowTraversalCallback`
 *     Fallback when allowTraversal is absent/undefined.
 *   - Line 46: `return false;` in default allowTraversalCallback
 *     Rejection branch that terminates traversal when a cycle revisits a seen vertex.
 *   - Line 52: `callbacks.enterVertex || stubCallback`
 *     Fallback no-op when enterVertex is absent.
 *   - Line 53: `callbacks.leaveVertex || stubCallback`
 *     Fallback no-op when leaveVertex is absent.
 * - Mutation: Populates properties on the passed callbacks object in place.
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
 * @param {GraphVertex} currentVertex
 * @param {GraphVertex} previousVertex
 * @param {Callbacks} callbacks
 */
function depthFirstSearchRecursive(graph, currentVertex, previousVertex, callbacks) {
  callbacks.enterVertex({ currentVertex, previousVertex });

  graph.getNeighbors(currentVertex).forEach((nextVertex) => {
    if (callbacks.allowTraversal({ previousVertex, currentVertex, nextVertex })) {
      depthFirstSearchRecursive(graph, nextVertex, currentVertex, callbacks);
    }
  });

  callbacks.leaveVertex({ currentVertex, previousVertex });
}

/**
 * @param {Graph} graph
 * @param {GraphVertex} startVertex
 * @param {Callbacks} [callbacks]
 */
export default function depthFirstSearch(graph, startVertex, callbacks) {
  const previousVertex = null;
  depthFirstSearchRecursive(graph, startVertex, previousVertex, initCallbacks(callbacks));
}
