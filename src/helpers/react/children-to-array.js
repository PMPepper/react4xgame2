import {Children, Fragment} from 'react';


export default function childrenToArray(children, preserveKeys = false) {
  if(!children) {
    return [];
  }

  if(preserveKeys) {
    const output = [];

    Children.forEach(children, child => {
      if(child.type === Fragment) {
        output.push(...childrenToArray(child.props.children, true));
      } else {
        output.push(child);
      }
    })

    return output;
  }

  return Children.toArray(children);
}
