import getDescendants from './get-descendants';
import isFocusable from './is-focusable';

const keyboardOnlyFilter = (elem) => isFocusable(elem, true);

export default function getFocusableElements(container, keyboardOnly = false) {
  const filter = keyboardOnly ? keyboardOnlyFilter : isFocusable;

  return getDescendants(container).filter(filter);
}
