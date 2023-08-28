import {Children, Fragment, ReactElement, ReactNode} from 'react';


export default function childrenToArray(children: ReactNode | ReactNode[], preserveKeys: boolean = false): ReactNode[] {
  if(!children) {
    return [];
  }

  if(preserveKeys) {
    const output = [];

    Children.forEach(children, child => {
      if((child as ReactElement).type === Fragment) {
        output.push(...childrenToArray((child as ReactElement).props.children, true));
      } else {
        output.push(child);
      }
    })

    return output;
  }

  return Children.toArray(children);
}
