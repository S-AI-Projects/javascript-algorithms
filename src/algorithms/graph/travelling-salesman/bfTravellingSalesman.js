/**
 * Find all maximal simple paths starting from a given vertex using recursive depth-first search.
 *
 * Traversal and State Transitions:
 * - Input state: Starts at `startVertex` with current `path` prefix (default `[]`) and
 *   accumulator `paths` (default `[]`).
 * - Intermediate state: Clones `path` into `currentPath`, appends `startVertex`,
 *   computes `visitedSet` from `currentPath` to prevent cycles, and retrieves
 *   unvisited neighbors of `startVertex`.
 * - Decisive state transition: When `unvisitedNeighbors.length === 0`, all reachable
 *   neighbors from this branch have been visited, marking the current path complete.
 *   The branch terminates recursion, pushes `currentPath` to `paths`, and backtracks.
 *   Otherwise, recurses into each unvisited neighbor.
 *
 * Worked Example:
 * ```javascript
 * import GraphVertex from '../../../../data-structures/graph/GraphVertex';
 * import GraphEdge from '../../../../data-structures/graph/GraphEdge';
 * import Graph from '../../../../data-structures/graph/Graph';
 * import { findAllPaths } from './bfTravellingSalesman';
 *
 * const vertexA = new GraphVertex('A');
 * const vertexB = new GraphVertex('B');
 * const vertexC = new GraphVertex('C');
 *
 * const graph = new Graph();
 * graph
 *   .addEdge(new GraphEdge(vertexA, vertexB))
 *   .addEdge(new GraphEdge(vertexB, vertexC))
 *   .addEdge(new GraphEdge(vertexA, vertexC));
 *
 * const paths = findAllPaths(vertexA);
 * // paths.map(p => p.map(v => v.getKey())) => [['A', 'B', 'C'], ['A', 'C', 'B']]
 * ```
 *
 * @param {GraphVertex} startVertex - Starting vertex for path exploration.
 * @param {GraphVertex[][]} [paths=[]] - Accumulator array collecting completed paths.
 * @param {GraphVertex[]} [path=[]] - Current path prefix leading up to startVertex.
 * @return {GraphVertex[][]} All complete maximal paths originating from startVertex.
 */
export function findAllPaths(startVertex, paths = [], path = []) {
  // Clone path.
  const currentPath = [...path];

  // Add startVertex to the path.
  currentPath.push(startVertex);

  // Generate visited set from path.
  const visitedSet = currentPath.reduce((accumulator, vertex) => {
    const updatedAccumulator = { ...accumulator };
    updatedAccumulator[vertex.getKey()] = vertex;

    return updatedAccumulator;
  }, {});

  // Get all unvisited neighbors of startVertex.
  const unvisitedNeighbors = startVertex.getNeighbors().filter((neighbor) => {
    return !visitedSet[neighbor.getKey()];
  });

  // If there no unvisited neighbors then treat current path as complete and save it.
  if (!unvisitedNeighbors.length) {
    paths.push(currentPath);

    return paths;
  }

  // Go through all the neighbors.
  for (let neighborIndex = 0; neighborIndex < unvisitedNeighbors.length; neighborIndex += 1) {
    const currentUnvisitedNeighbor = unvisitedNeighbors[neighborIndex];
    findAllPaths(currentUnvisitedNeighbor, paths, currentPath);
  }

  return paths;
}

/**
 * @param {number[][]} adjacencyMatrix
 * @param {object} verticesIndices
 * @param {GraphVertex[]} cycle
 * @return {number}
 */
function getCycleWeight(adjacencyMatrix, verticesIndices, cycle) {
  let weight = 0;

  for (let cycleIndex = 1; cycleIndex < cycle.length; cycleIndex += 1) {
    const fromVertex = cycle[cycleIndex - 1];
    const toVertex = cycle[cycleIndex];
    const fromVertexIndex = verticesIndices[fromVertex.getKey()];
    const toVertexIndex = verticesIndices[toVertex.getKey()];
    weight += adjacencyMatrix[fromVertexIndex][toVertexIndex];
  }

  return weight;
}

/**
 * BRUTE FORCE approach to solve Traveling Salesman Problem.
 *
 * @param {Graph} graph
 * @return {GraphVertex[]}
 */
export default function bfTravellingSalesman(graph) {
  // Pick starting point from where we will traverse the graph.
  const startVertex = graph.getAllVertices()[0];

  // BRUTE FORCE.
  // Generate all possible paths from startVertex.
  const allPossiblePaths = findAllPaths(startVertex);

  // Filter out paths that are not cycles.
  const allPossibleCycles = allPossiblePaths.filter((path) => {
    /** @var {GraphVertex} */
    const lastVertex = path[path.length - 1];
    const lastVertexNeighbors = lastVertex.getNeighbors();

    return lastVertexNeighbors.includes(startVertex);
  });

  // Go through all possible cycles and pick the one with minimum overall tour weight.
  const adjacencyMatrix = graph.getAdjacencyMatrix();
  const verticesIndices = graph.getVerticesIndices();
  let salesmanPath = [];
  let salesmanPathWeight = null;
  for (let cycleIndex = 0; cycleIndex < allPossibleCycles.length; cycleIndex += 1) {
    const currentCycle = allPossibleCycles[cycleIndex];
    const currentCycleWeight = getCycleWeight(adjacencyMatrix, verticesIndices, currentCycle);

    // If current cycle weight is smaller then previous ones treat current cycle as most optimal.
    if (salesmanPathWeight === null || currentCycleWeight < salesmanPathWeight) {
      salesmanPath = currentCycle;
      salesmanPathWeight = currentCycleWeight;
    }
  }

  // Return the solution.
  return salesmanPath;
}
