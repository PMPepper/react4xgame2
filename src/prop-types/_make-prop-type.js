export default function makeProp(test) {
  function propTest(props, propName, componentName) {
    if(isNotSet(props, propName)) {
      return null;
    }

    return test(props, propName, componentName);
  }

  propTest.isRequired = test;

  return propTest;
}

function isNotSet(props, propName) {
  return !props.hasOwnProperty(propName) || props[propName] === null || props[propName] === undefined;
}
