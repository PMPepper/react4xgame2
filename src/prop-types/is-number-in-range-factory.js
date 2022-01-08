import makePropType from './_make-prop-type';


export default function isNumberInRangeFactory(min, max) {
  return makePropType(function isNumberInRange(props, propName, componentName) {
    const prop = props[propName];

    if(isNaN(prop) || prop < min || prop > max) {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Must be a number between ${min} and ${max}, was '${prop}'`);
    }

    return null;
  });
}
