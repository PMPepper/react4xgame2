import isElementAvailableToUser from './is-element-available-to-user';


export default function isFocusable(elem?: Element, keyboardOnly: boolean = false): boolean {
  if(!elem || !isElementAvailableToUser(elem)) {
    return false;
  }

  switch(elem.nodeName.toLowerCase()) {
    case 'input':
    case 'select':
    case 'textarea':
    case 'button':
      if(!elem.hasAttribute('disabled')) {
        return true;
      }
      break;
    case 'a':
    case 'area':
      if(elem.hasAttribute('href')) {
        return true;
      }
      break;
    case 'iframe':
      return true;
    default:
      if(elem.hasAttribute('tabindex') && (+elem.getAttribute('tabindex')) > (keyboardOnly ? -1 : -2)) {
        return true;
      }
  }

  return false;
}
