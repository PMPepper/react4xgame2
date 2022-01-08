export default function resolvePath(obj, path) {
  return normalisePath(path).reduce(function(prev, curr) {
    return prev ? prev[curr] : undefined
  }, obj);
}

export function normalisePath(path) {
  return typeof(path) === 'string' ?
    path
      .replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
      .replace(/^\./, '')           // strip a leading dot
      .split('.')
    :
    path;
}
