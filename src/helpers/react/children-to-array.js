import React from 'react';


export default function childrenToArray(children, preserveKeys = false) {
  return children ?
    (preserveKeys ?
      React.Children.map(children, child => (child))
      :
      React.Children.toArray(children) || []
    )
    :
    [];
}
