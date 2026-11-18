import Comparator from '../../../utils/comparator/Comparator';

/**
 * Linear search implementation.
 *
 * @param {*[]} array
 * @param {*} seekElement
 * @param {function(a, b)} [comparatorCallback]
 * @return {number[]}
 */
export default function linearSearch(array, seekElement, comparatorCallback) {
  const comparator = new Comparator(comparatorCallback);
  const foundIndices = [];
  const matchesSeekElement = (element) => comparator.equal(element, seekElement);

  array.forEach((element, index) => {
    if (matchesSeekElement(element)) {
      foundIndices.push(index);
    }
  });

  return foundIndices;
}
