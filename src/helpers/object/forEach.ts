
export default function forEachObject<T, K extends string | number | symbol>(obj: Record<K, T>, forEachFunc: (value: T, key: K, obj: Record<K, T>) => void): Record<K, T>;
export default function forEachObject<T, K extends string | number | symbol>(obj: Partial<Record<K, T>>, forEachFunc: (value: T, key: K, obj: Partial<Record<K, T>>) => void): Partial<Record<K, T>>;
export default function forEachObject<T, K extends string | number | symbol>(obj: Partial<Record<K, T>>, forEachFunc: (value: T, key: K, obj: Partial<Record<K, T>>) => void): Partial<Record<K, T>> {
  for(let i = 0, k = Object.keys(obj), l = k.length; i < l; ++i) {
    const key = k[i] as K;
    const value = obj[key];

    forEachFunc(value, key, obj);
  }

  return obj;
}
