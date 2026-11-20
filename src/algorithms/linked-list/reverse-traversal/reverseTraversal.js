/**
 * Traversal callback function.
 * @callback traversalCallback
 * @param {*} nodeValue
 */

/**
 * Recursively traverses linked list nodes from tail to head, invoking callback
 * with each node's value in reverse order.
 *
 * Contract & Invariants:
 * - Public inputs:
 *     @param {LinkedListNode|null} node - head or current node in the list
 *     @param {traversalCallback} callback - invoked once per node with node.value
 * - Return value:
 *     @returns {void} - returns undefined; operates purely via callback
 * - Mutation contract:
 *     Pure / non-mutating. Neither node.value nor node.next links are modified.
 * - External dependencies: None.
 *
 * @param {LinkedListNode} node
 * @param {traversalCallback} callback
 */
export function reverseTraversalRecursive(node, callback) {
  if (node) {
    reverseTraversalRecursive(node.next, callback);
    callback(node.value);
  }
}

/**
 * @param {LinkedList} linkedList
 * @param {traversalCallback} callback
 */
export default function reverseTraversal(linkedList, callback) {
  reverseTraversalRecursive(linkedList.head, callback);
}
