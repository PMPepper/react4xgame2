import isElementHidden from './is-element-hidden';


export default function isFocusable(elem, keyboardOnly = false) {
  if(!elem || isElementHidden(elem)) {
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
