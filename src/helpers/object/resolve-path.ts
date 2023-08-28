type PathType = string[] | string;

/**
 * Allow access to an objects properties (and properties of sub-objects)
 * using a string to describe the 'path', e.g. "hello.world"
 * I'm not going to be able to give this better typing. 
 * 
 * @param obj 
 * @param path Either a string where each level is delineated by a ., or an array of string where each entry is a level
 * @returns the value at the specified point, or undefined if the path does not exist
 */
export default function resolvePath(obj: any, path: PathType): any {
  return normalisePath(path).reduce(function(prev, curr) {
    return prev ? prev[curr] : undefined
  }, obj);
}

export function normalisePath(path: PathType) {
  return typeof(path) === 'string' ?
    path
      .replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
      .replace(/^\./, '')           // strip a leading dot
      .split('.')
    :
    path;
}
