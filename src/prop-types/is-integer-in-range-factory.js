import makePropType from './_make-prop-type';


export default function isIntegerInRangeFactory(min, max) {
  return makePropType(function isIntegerInRange(props, propName, componentName) {
    const prop = props[propName];

    if(!Number.isInteger(prop) || prop < min || prop > max) {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Must be an integer between ${min} and ${max}, was '${prop}'`);
    }

    return null;
  });
}
