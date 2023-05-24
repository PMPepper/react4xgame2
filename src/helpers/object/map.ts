export default function mapObject<TFrom, TTo>(obj: Record<string, TFrom>, mapFunc: (value: TFrom, key: string, obj: Record<string, TFrom>) => TTo ): Record<string, TTo> {
  const output: Record<string, TTo> = {};

  for(let i = 0, k = Object.keys(obj), l = k.length; i < l; ++i) {
    const key = k[i];
    const value = obj[key];

    output[key] = mapFunc(value, key, obj);
  }

  return output;
}
