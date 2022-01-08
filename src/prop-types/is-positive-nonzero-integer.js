import makePropType from './_make-prop-type';


export default makePropType(function isPositiveNonZeroInteger(props, propName, componentName) {
  const prop = props[propName];

  if(!Number.isInteger(prop) || prop < 1) {
    return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Must be a positive integer greater than 0, was '${prop}'`);
  }

  return null;
});
