//What this really means is 'is this element accessible to the user in the DOM'
//as such, does not take into account:
// - Opacity
// - Overflow
// - Scrolling
// - Transformations
// - clipping
// - The viewport
// - Z-index / being obscured by other elements
// - If the element actually contains anything to 'see'
export default function isElementAvailableToUser(elem?: Element) {
  if(!!elem && document.contains(elem) && elem.getClientRects().length > 0) {//Is there an element, is it in the DOM, and is it (and all of it's parents) not display: none OR has the hidden attribute
    const styles = getComputedStyle(elem);

    return styles.visibility !== 'hidden';
  }

  return false;
}
