export default function mapToSortedArray<T, O, K extends string | number | symbol = string>(
  obj: Record<K, T>, 
  mapFunc: (value: T, key: K, obj: Record<K, T>) => O, 
  sortFunc: (undefined | ((a: O, b: O) => number)),
  filterFunc: ((value: T, key: K, obj: Record<K, T>) => boolean) | undefined, 
  sortOnMapped: true
): O[]

export default function mapToSortedArray<T, O, K extends string | number | symbol = string>(
  obj: Record<K, T>, 
  mapFunc: (value: T, key: K, obj: Record<K, T>) => O, 
  sortFunc: ((a: T, b: T) => number) | undefined,
  filterFunc: ((value: T, key: K, obj: Record<K, T>) => boolean) | undefined, 
  sortOnMapped: false
): O[]

export default function mapToSortedArray<T, O, K extends string | number | symbol = string>(
  obj: Record<K, T>, 
  mapFunc: (value: T, key: K, obj: Record<K, T>) => O, 
  sortFunc?: ((a: T, b: T) => number) | ((a: O, b: O) => number),
  filterFunc?: (value: T, key: K, obj: Record<K, T>) => boolean, 
  sortOnMapped?: boolean
): O[]

export default function mapToSortedArray<T, O, K extends string | number | symbol = string>(
  obj: Record<K, T>, 
  mapFunc: (value: T, key: K, obj: Record<K, T>) => O, 
  sortFunc?: any,
  filterFunc?: (value: T, key: K, obj: Record<K, T>) => boolean, 
  sortOnMapped: boolean = false
): O[] {
  const mapped: Partial<Record<K, O>> = {};
  const keys: K[] = [];

  for(let i = 0, k = Object.keys(obj), l = k.length; i < l; ++i) {
    const key = k[i] as K;
    const value = obj[key];

    if(!filterFunc || filterFunc(value, key, obj)) {
      keys.push(key);
      mapped[key] = mapFunc(value, key, obj);
    }
  }

  if(sortFunc) {
    keys.sort(sortOnMapped
      ? (a: K, b: K) => {
        return sortFunc(mapped[a], mapped[b]);
      }
      : (a: K, b: K) => {
        return sortFunc(obj[a], obj[b]);
      }
    );
  }
  
  return keys.map(key => (mapped[key]));
}
