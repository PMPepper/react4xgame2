
export default function every(object, testFunc) {
    for(let i = 0, keys = Object.keys(object), key = null; i < keys.length; i++) {
      key = keys[i];
  
      if(!testFunc(object[key], key, object)) {
        return false;
      }
    }
  
    return true;
  }
  