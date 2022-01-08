export default function isElementHidden(elem) {
  return !( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}
