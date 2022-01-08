export default function(obj, findFunc) {
  const keys = Object.keys(obj);

  for(let i = 0, l = keys.length; i < l; ++i) {
    let key = keys[i];
    let value = obj[key];

    if(findFunc(obj[key], key, obj)) {
      return value;
    }
  }

  return null;
}
