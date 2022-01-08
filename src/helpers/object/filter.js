export default function objectFilter(object, filterFunc) {
  const keys = Object.keys(object);
  const output = {};

  for(let i = 0, l = keys.length; i < l; ++i) {
    const key = keys[i];
    const value = object[key];

    if(filterFunc(value, key, object)) {
      output[key] = value;
    }
  }

  return output;
}
