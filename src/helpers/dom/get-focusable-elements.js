import getDescendants from './get-descendants';
import isFocusable from './is-focusable';


export default function getFocusableElements(container) {
  return getDescendants(container).filter(isFocusable);
}
