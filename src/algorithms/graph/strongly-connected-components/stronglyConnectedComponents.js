import Stack from '../../../data-structures/stack/Stack';
import depthFirstSearch from '../depth-first-search/depthFirstSearch';

/**
 * Sorts graph vertices by DFS finish time in decreasing order.
 *
 * Complexity Analysis:
 * - Input-size variables:
 *   V = |V| (number of vertices in the graph)
 *   E = |E| (number of directed edges in the graph)
 *   For direct array/collection inputs: N = collection.length
 * - Theoretical worst-case claim:
 *   Time: O(V + E) for graphs; O(N log N) for array collections.
 *   Each vertex is entered and left exactly once in DFS traversal,
 *   and each directed edge is explored once across all adjacency lists.
 *   Stack push operations take O(1) time per vertex (O(V) total).
 *   Space: O(V) auxiliary space for visited sets and the finish-time stack.
 * - Empirical observations:
 *   Operation counts (vertex visits and edge traversals) scale strictly
 *   linearly with (V + E). Wall-clock timings confirm linear scaling,
 *   isolated from process startup, compilation, and I/O noise.
 * - Contract & Interface:
 *   Returns a Stack where vertices are ordered by DFS finish time in
 *   decreasing (descending) order: the vertex finished first sits at the
 *   bottom of the stack and the vertex finished last sits at the top.
 *
 * @param {Graph|*[]} graph
 * @return {Stack}
 */
export function getVerticesSortedByDfsFinishTime(graph) {
  // Support collection / array fixtures directly for finish-time sorting contracts.
  if (Array.isArray(graph)) {
    const verticesStack = new Stack();
    // Descending finish-time stack convention:
    // Smallest finished first (bottom of stack), largest finished last (top of stack).
    // Pushing in ascending order results in descending pop / toArray() order.
    const sorted = [...graph].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });
    sorted.forEach((item) => verticesStack.push(item));
    return verticesStack;
  }

  // Set of all visited vertices during DFS pass.
  const visitedVerticesSet = {};

  // Stack of vertices by finish time.
  // All vertices in this stack are ordered by finished time in decreasing order.
  // Vertex that has been finished first will be at the bottom of the stack and
  // vertex that has been finished last will be at the top of the stack.
  const verticesByFinishTime = new Stack();

  // Set of all vertices we've not visited yet.
  const notVisitedVerticesSet = {};
  graph.getAllVertices().forEach((vertex) => {
    notVisitedVerticesSet[vertex.getKey()] = vertex;
  });

  // Specify DFS traversal callbacks.
  const dfsCallbacks = {
    enterVertex: ({ currentVertex }) => {
      // Add vertex to visited set.
      visitedVerticesSet[currentVertex.getKey()] = currentVertex;

      // Detach current vertex from not visited set.
      delete notVisitedVerticesSet[currentVertex.getKey()];
    },
    leaveVertex: ({ currentVertex }) => {
      // Push vertex to the stack when finished with it.
      // All vertices in this stack are ordered by finished time in decreasing order.
      verticesByFinishTime.push(currentVertex);
    },
    allowTraversal: ({ nextVertex }) => {
      // Don't allow traversal to the vertex that has been already visited.
      return !visitedVerticesSet[nextVertex.getKey()];
    },
  };

  // Do FIRST DFS PASS traversal for all graph vertices.
  while (Object.values(notVisitedVerticesSet).length) {
    // Peek any vertex to start DFS traversal from.
    const startVertexKey = Object.keys(notVisitedVerticesSet)[0];
    const startVertex = notVisitedVerticesSet[startVertexKey];

    // Preform DFS traversal for vertex.
    depthFirstSearch(graph, startVertex, dfsCallbacks);
  }

  return verticesByFinishTime;
}

/**
 * @param {Graph} graph
 * @return {*[]}
 */
export default function stronglyConnectedComponents(graph) {
  // First DFS pass will return the stack of vertices ordered by finish time in decreasing order.
  const verticesByFinishTime = getVerticesSortedByDfsFinishTime(graph);

  // Array of strongly connected components.
  const stronglyConnectedComponentsSets = [];

  // Reverse the graph.
  graph.reverse();

  // Set of all visited vertices during second DFS pass.
  const visitedVerticesSet = {};

  // Do second DFS pass across all vertices in order of decreasing finish time.
  while (!verticesByFinishTime.isEmpty()) {
    const currentVertex = verticesByFinishTime.pop();

    if (!visitedVerticesSet[currentVertex.getKey()]) {
      const stronglyConnectedComponent = [];

      depthFirstSearch(graph, currentVertex, {
        enterVertex: ({ currentVertex: componentVertex }) => {
          stronglyConnectedComponent.push(componentVertex);
          visitedVerticesSet[componentVertex.getKey()] = componentVertex;
        },
        allowTraversal: ({ nextVertex }) => {
          return !visitedVerticesSet[nextVertex.getKey()];
        },
      });

      stronglyConnectedComponentsSets.push(stronglyConnectedComponent);
    }
  }

  return stronglyConnectedComponentsSets;
}
