
export default function every<T extends {}>(object: T, testFunc: <K extends keyof T>(value: T[K], key: K, obj: T) => boolean) {
    for(let i = 0, keys = Object.keys(object), key = null; i < keys.length; i++) {
      key = keys[i];
  
      if(!testFunc(object[key], key, object)) {
        return false;
      }
    }
  
    return true;
  }
  