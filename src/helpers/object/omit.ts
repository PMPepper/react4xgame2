export default function omit<T extends {}, K extends keyof T = keyof T>(object: T, keys: K[]): Pick<T, Exclude<keyof T, (typeof keys)[number]>> {
  if(!object) {
    return object;
  }

  return Object.keys(object).reduce((result, key) => {
    if(keys.indexOf(key as K) == -1) {
       result[key] = object[key];
    }
    return result;
  }, {} as any);
}
