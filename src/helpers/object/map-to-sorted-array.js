export default function mapToSortedArray(obj, mapFunc, sortFunc, sortOnMapped = false) {
  const mapped = {};
  const keys = [];

  for(let i = 0, k = Object.keys(obj), l = k.length; i < l; ++i) {
    const key = k[i];
    const value = obj[key];

    keys.push(key);
    mapped[key] = mapFunc(value, key, obj);
  }

  const mappedSortFunc = sortOnMapped ?
    (a, b) => {
      return sortFunc(mapped[a], mapped[b]);
    }
    :
    (a, b) => {
      return sortFunc(obj[a], obj[b]);
    };

  keys.sort(mappedSortFunc);

  return keys.map(key => (mapped[key]));
}
