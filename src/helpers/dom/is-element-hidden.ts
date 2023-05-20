export default function isElementHidden(elem: HTMLElement) {//TODO this check is incomplete - won't pick up visibility: hidden
  return !( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}
