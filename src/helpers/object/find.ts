export default function find<T extends {}>(obj: T, findFunc: <K extends keyof T>(value: T[K], key: K, obj: T) => boolean) {
  const keys = Object.keys(obj);

  for(let i = 0, l = keys.length; i < l; ++i) {
    let key = keys[i] as keyof T;
    let value = obj[key];

    if(findFunc(obj[key], key, obj)) {
      return value;
    }
  }

  return null;
}
