import makePropType from './_make-prop-type';


export default makePropType(function isPositiveInteger(props, propName, componentName) {
  const prop = props[propName];

  if(!Number.isInteger(prop) && prop >= 0) {
    return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Must be a positive integer, was '${prop}'`);
  }

  return null;
});
