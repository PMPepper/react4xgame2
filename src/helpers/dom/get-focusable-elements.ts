import getDescendants from './get-descendants';
import isFocusable from './is-focusable';

const keyboardOnlyFilter = (elem: Element) => isFocusable(elem, true);

export default function getFocusableElements(container, keyboardOnly = false) {
  const filter = keyboardOnly ? keyboardOnlyFilter : (elem: Element) => isFocusable(elem);

  return getDescendants(container).filter(filter);
}
