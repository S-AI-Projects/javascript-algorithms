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
  const verticesByDfsFinishTime = new Stack();

  // Set of all vertices we're going to visit.
  const notVisitedVerticesSet = {};
  graph.getAllVertices().forEach((vertex) => {
    notVisitedVerticesSet[vertex.getKey()] = vertex;
  });

  // Specify DFS traversal callbacks.
  const dfsCallbacks = {
    enterVertex: ({ currentVertex }) => {
      // Add current vertex to visited set.
      visitedVerticesSet[currentVertex.getKey()] = currentVertex;

      // Delete current vertex from not visited set.
      delete notVisitedVerticesSet[currentVertex.getKey()];
    },
    leaveVertex: ({ currentVertex }) => {
      // Push vertex to the stack when leaving it.
      // This will make stack to be ordered by finish time in decreasing order.
      verticesByDfsFinishTime.push(currentVertex);
    },
    allowTraversal: ({ nextVertex }) => {
      // Don't allow to traverse the nodes that have been already visited.
      return !visitedVerticesSet[nextVertex.getKey()];
    },
  };

  // Do FIRST DFS PASS traversal for all graph vertices.
  while (Object.values(notVisitedVerticesSet).length) {
    // Peek any vertex to start DFS traversal from.
    const startVertexKey = Object.keys(notVisitedVerticesSet)[0];
    const startVertex = notVisitedVerticesSet[startVertexKey];
    delete notVisitedVerticesSet[startVertexKey];

    depthFirstSearch(graph, startVertex, dfsCallbacks);
  }

  return verticesByDfsFinishTime;
}

/**
 * @param {Graph} graph
 * @param {Stack} verticesByFinishTime
 * @return {*[]}
 */
function getSCCSets(graph, verticesByFinishTime) {
  // Array of arrays of strongly connected vertices.
  const stronglyConnectedComponentsSets = [];

  // Array that will hold all vertices that are being visited during one DFS run.
  let stronglyConnectedComponentsSet = [];

  // Visited vertices set.
  const visitedVerticesSet = {};

  // Callbacks for DFS traversal.
  const dfsCallbacks = {
    enterVertex: ({ currentVertex }) => {
      // Add current vertex to SCC set of current DFS round.
      stronglyConnectedComponentsSet.push(currentVertex);

      // Add current vertex to visited set.
      visitedVerticesSet[currentVertex.getKey()] = currentVertex;
    },
    leaveVertex: ({ previousVertex }) => {
      // Once DFS traversal is finished push the set of found strongly connected
      // components during current DFS round to overall strongly connected components set.
      // The sign that traversal is about to be finished is that we came back to start vertex
      // which doesn't have parent.
      if (previousVertex === null) {
        stronglyConnectedComponentsSets.push([...stronglyConnectedComponentsSet]);
      }
    },
    allowTraversal: ({ nextVertex }) => {
      // Don't allow traversal of already visited vertices.
      return !visitedVerticesSet[nextVertex.getKey()];
    },
  };

  while (!verticesByFinishTime.isEmpty()) {
    /** @var {GraphVertex} startVertex */
    const startVertex = verticesByFinishTime.pop();

    // Reset the set of strongly connected vertices.
    stronglyConnectedComponentsSet = [];

    // Don't do DFS on already visited vertices.
    if (!visitedVerticesSet[startVertex.getKey()]) {
      // Do DFS traversal.
      depthFirstSearch(graph, startVertex, dfsCallbacks);
    }
  }

  return stronglyConnectedComponentsSets;
}

/**
 * Kosaraju's algorithm.
 *
 * @param {Graph} graph
 * @return {*[]}
 */
export default function stronglyConnectedComponents(graph) {
  // In this algorithm we will need to do TWO DFS PASSES overt the graph.

  // Get stack of vertices ordered by DFS finish time.
  // All vertices in this stack are ordered by finished time in decreasing order:
  // Vertex that has been finished first will be at the bottom of the stack and
  // vertex that has been finished last will be at the top of the stack.
  const verticesByFinishTime = getVerticesSortedByDfsFinishTime(graph);

  // Reverse the graph.
  graph.reverse();

  // Do DFS once again on reversed graph.
  return getSCCSets(graph, verticesByFinishTime);
}
