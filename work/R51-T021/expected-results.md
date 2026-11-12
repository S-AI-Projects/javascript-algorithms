R51-T021 - Independent Expected Results

Function: reverseTraversal(linkedList, callback)

Inputs:
- A linked list, which may be empty.
- A callback that receives each node's value.

Expected behavior:
- Callback is invoked once per node, from tail to head.
- Return value is undefined.
- Node values and links remain unchanged.
- Head and tail references remain unchanged.

Fixtures:

1. Empty list
   Expected callback values: []

2. Single node A
   Expected callback values: [A]

3. Three nodes A -> B -> C
   Expected callback values: [C, B, A]

4. Repeated values A -> B -> A
   Expected callback values: [A, B, A]

These expected results were written before running the implementation.
