import makePropType from './_make-prop-type';


export default (value) => {
  return makePropType(function isValue(props, propName, componentName) {
    const prop = props[propName];

    return prop !== value ? new Error(`Invalid prop ${propName} supplied to ${componentName}. Is not value '${value}', was '${prop}'`) : null;
  });
}
