import {isValidElement} from 'react';
import makePropType from './_make-prop-type';


export default makePropType(function isReactElement(props, propName, componentName) {
  const prop = props[propName];

  if(!isValidElement(prop)) {
    return new Error(`Invalid prop ${propName} supplied to ${componentName}. Is not a valid react element, was '${prop}'`)
  }

  return null;
});
