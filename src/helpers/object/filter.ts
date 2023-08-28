export default function objectFilter<T extends {}>(object: T, filterFunc: <K extends keyof T>(value: T[K], key: K, obj: T) => boolean): Partial<T> {
  const keys = Object.keys(object) as (keyof T)[];
  const output: Partial<T> = {};

  for(let i = 0, l = keys.length; i < l; ++i) {
    const key = keys[i];
    const value = object[key];

    if(filterFunc(value, key, object)) {
      output[key] = value;
    }
  }

  return output;
}
