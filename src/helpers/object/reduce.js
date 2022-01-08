export default function objectReduce(object, reducerFunc, initialValue) {
  const keys = Object.keys(object);
  let output = initialValue;

  for(let i = 0, l = keys.length; i < l; ++i) {
    let key = keys[i];

    output = reducerFunc(output, object[key], key);
  }

  return output;
}
