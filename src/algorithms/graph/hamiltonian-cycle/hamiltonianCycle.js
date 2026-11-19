import GraphVertex from '../../../data-structures/graph/GraphVertex';

/**
 * Check whether vertexCandidate can be appended to the current Hamiltonian
 * path without breaking correctness.
 *
 * Complexity (input-size variable: k = cycle.length, the current path length):
 *   - Adjacency-matrix look-up: O(1) — two index reads and one array access.
 *   - Duplicate scan via Array.prototype.find: O(k) — iterates at most k
 *     vertices already in the path.
 *   - Overall per-call: O(k).
 *   - Worst-case across all calls in hamiltonianCycleRecursive: each call
 *     receives a path of length 1..n, so the total work for all isSafe
 *     invocations is bounded by O(n · n!) where n is the number of vertices,
 *     reflecting the factorial branching of the backtracking search.
 *   - This O(k) observation is confirmed experimentally (see work/R51-T029/):
 *     operation counts grow linearly with cycle length k, independent of the
 *     wall-clock speed of the host machine.
 *
 * @param {number[][]} adjacencyMatrix
 * @param {object} verticesIndices
 * @param {GraphVertex[]} cycle
 * @param {GraphVertex} vertexCandidate
 * @return {boolean}
 */
function isSafe(adjacencyMatrix, verticesIndices, cycle, vertexCandidate) {
  const endVertex = cycle[cycle.length - 1];

  // Get end and candidate vertices indices in adjacency matrix.
  const candidateVertexAdjacencyIndex = verticesIndices[vertexCandidate.getKey()];
  const endVertexAdjacencyIndex = verticesIndices[endVertex.getKey()];

  // Check if last vertex in the path and candidate vertex are adjacent.
  if (adjacencyMatrix[endVertexAdjacencyIndex][candidateVertexAdjacencyIndex] === Infinity) {
    return false;
  }

  // Check if vertexCandidate is being added to the path for the first time.
  const candidateDuplicate = cycle.find((vertex) => vertex.getKey() === vertexCandidate.getKey());

  return !candidateDuplicate;
}

/**
 * @param {number[][]} adjacencyMatrix
 * @param {object} verticesIndices
 * @param {GraphVertex[]} cycle
 * @return {boolean}
 */
function isCycle(adjacencyMatrix, verticesIndices, cycle) {
  // Check if first and last vertices in hamiltonian path are adjacent.

  // Get start and end vertices from the path.
  const startVertex = cycle[0];
  const endVertex = cycle[cycle.length - 1];

  // Get start/end vertices indices in adjacency matrix.
  const startVertexAdjacencyIndex = verticesIndices[startVertex.getKey()];
  const endVertexAdjacencyIndex = verticesIndices[endVertex.getKey()];

  // Check if we can go from end vertex to the start one.
  return adjacencyMatrix[endVertexAdjacencyIndex][startVertexAdjacencyIndex] !== Infinity;
}

/**
 * @param {number[][]} adjacencyMatrix
 * @param {GraphVertex[]} vertices
 * @param {object} verticesIndices
 * @param {GraphVertex[][]} cycles
 * @param {GraphVertex[]} cycle
 */
function hamiltonianCycleRecursive({
  adjacencyMatrix,
  vertices,
  verticesIndices,
  cycles,
  cycle,
}) {
  // Clone cycle in order to prevent it from modification by other DFS branches.
  const currentCycle = [...cycle].map((vertex) => new GraphVertex(vertex.value));

  if (vertices.length === currentCycle.length) {
    // Hamiltonian path is found.
    // Now we need to check if it is cycle or not.
    if (isCycle(adjacencyMatrix, verticesIndices, currentCycle)) {
      // Another solution has been found. Save it.
      cycles.push(currentCycle);
    }
    return;
  }

  for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex += 1) {
    // Get vertex candidate that we will try to put into next path step and see if it fits.
    const vertexCandidate = vertices[vertexIndex];

    // Check if it is safe to put vertex candidate to cycle.
    if (isSafe(adjacencyMatrix, verticesIndices, currentCycle, vertexCandidate)) {
      // Add candidate vertex to cycle path.
      currentCycle.push(vertexCandidate);

      // Try to find other vertices in cycle.
      hamiltonianCycleRecursive({
        adjacencyMatrix,
        vertices,
        verticesIndices,
        cycles,
        cycle: currentCycle,
      });

      // BACKTRACKING.
      // Remove candidate vertex from cycle path in order to try another one.
      currentCycle.pop();
    }
  }
}

/**
 * @param {Graph} graph
 * @return {GraphVertex[][]}
 */
export default function hamiltonianCycle(graph) {
  // Gather some information about the graph that we will need to during
  // the problem solving.
  const verticesIndices = graph.getVerticesIndices();
  const adjacencyMatrix = graph.getAdjacencyMatrix();
  const vertices = graph.getAllVertices();

  // Define start vertex. We will always pick the first one
  // this it doesn't matter which vertex to pick in a cycle.
  // Every vertex is in a cycle so we can start from any of them.
  const startVertex = vertices[0];

  // Init cycles array that will hold all solutions.
  const cycles = [];

  // Init cycle array that will hold current cycle path.
  const cycle = [startVertex];

  // Try to find cycles recursively in Depth First Search order.
  hamiltonianCycleRecursive({
    adjacencyMatrix,
    vertices,
    verticesIndices,
    cycles,
    cycle,
  });

  // Return found cycles.
  return cycles;
}
