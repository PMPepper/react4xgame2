export default function omit(object, keys) {
  if(!object) {
    return null;
  }

  return Object.keys(object).reduce((result, key) => {
    if(keys.indexOf(key) == -1) {
       result[key] = object[key];
    }
    return result;
  }, {});
}
