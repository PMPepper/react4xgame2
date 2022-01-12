import {Children} from 'react';


export default function childrenToArray(children, preserveKeys = false) {
  if(!children) {
    return [];
  }

  if(preserveKeys) {
    const output = [];

    Children.forEach(children, child => {
      output.push(child);
    })

    return output;
  }

  return Children.toArray(children);
}
