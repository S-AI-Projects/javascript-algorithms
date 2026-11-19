# Failure-Path Coverage: kruskal (R51-T008)

## Tested Failure Path
- **Branch:** Lines 23-25 in `src/algorithms/graph/kruskal/kruskal.js`
- **Condition:** `if (graph.isDirected)`
- **Behavior:** Throws Error: `"Kruskal's algorithms works only for undirected graphs"`.
- **Caller State Preservation:** The input `Graph` instance remains valid and intact after the failure.
- **Post-Failure Continuation:** Subsequent invocations of `kruskal` on valid undirected graphs execute successfully.

## Empty Result Path
- Empty graph with 0 edges produces an empty MST (0 edges, 0 weight) without exceptions.
