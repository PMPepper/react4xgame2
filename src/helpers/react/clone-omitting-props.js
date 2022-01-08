import React from 'react';

import omit from '@/helpers/object/omit';


export default function cloneOmittingProps(element, omitProps, addProps = null) {
  const newProps = omit(element.props, omitProps);

  if(addProps) {
    for(let i = 0, keys = Object.keys(addProps), l = keys.length; i < l; ++i) {
      let key = keys[i];

      newProps[key] = addProps[key];
    }
  }

  if(element.key) {
    newProps.key = element.key;
  }

  //not 100% sure about this..? Seems to work...
  if(element.ref) {
    newProps.ref = element.ref;
  }

  return React.createElement(element.type, newProps);
}
