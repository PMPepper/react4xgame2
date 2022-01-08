import childrenToArray from './children-to-array';

export default function getChildrenOfType(children, ...types) {

  return childrenToArray(children).filter(child => (!types.includes(child.type)));
}
