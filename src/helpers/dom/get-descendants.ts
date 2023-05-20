export default function getDescendants(elem: Element): Element[] {
  return Array.prototype.slice.call(elem.querySelectorAll('*'));
}
