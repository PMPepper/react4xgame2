import {isValidElement} from 'react';
import makePropType from './_make-prop-type';


export default makePropType(function isReactRendable(props, propName, componentName) {
  const prop = props[propName];

  switch(typeof(prop)) {
    case 'string':
    case 'number':
    case 'boolean':
    //case 'function':
      return null;
    case 'object':
      if(prop instanceof Array || isValidElement(prop)) {
        return null;
      }
  }

  return new Error(`Invalid prop ${propName} supplied to ${componentName}. Is not rendable by React, was '${prop}'`)
})
