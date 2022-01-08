export default function getDescendants(elem) {
  return Array.prototype.slice.call(elem.querySelectorAll('*'));
}
