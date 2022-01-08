import makePropType from './_make-prop-type';


export default makePropType(function isPositiveNumber(props, propName, componentName) {
  const prop = +props[propName];

  if(isNaN(prop) || prop < 0) {
    return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Must be a positive number, was '${prop}'`);
  }

  return null;
});
