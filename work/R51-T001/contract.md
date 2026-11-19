# Contract: eulerianPath (R51-T001)

## Public Interface & Preconditions
- **Input:** `graph` (instance of `Graph`, line 24).
- **Edge Contract:** Edges must return keys via `getKey()` (line 36).
- **Vertex Contract:** Vertices must support `getDegree()` and `getKey()` (line 41).
- **Eulerian Feasibility:** Graph must have either 0 odd-degree vertices (circuit) or exactly 2 odd-degree vertices (path) (lines 53-57).

## Observable Mutation
- Fleury's algorithm mutates the input graph by deleting traversed edges via `graph.deleteEdge(edgeToDelete)` (line 112).
- When execution finishes, remaining edges count is 0.

## Verified Fixtures
1. **Smallest Valid Input:** 2 vertices, 1 edge -> `['A', 'B']`, remaining edges = 0.
2. **Ordinary Input:** 4 vertices, 3 edges -> `['A', 'B', 'C', 'D']`, remaining edges = 0.
3. **Domain Boundary:** Triangle circuit -> `['A', 'B', 'C', 'A']`, repeated start vertex, remaining edges = 0.
