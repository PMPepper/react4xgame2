export default function objectReduce<T extends {}, O>(object: T, reducerFunc: <K extends keyof T>(output: Partial<O>, value: T[K], key: K, obj: T) => Partial<O>, initialValue?: Partial<O>): O {
  const keys = Object.keys(object) as (keyof T)[];
  let output = initialValue;

  for(let i = 0, l = keys.length; i < l; ++i) {
    let key = keys[i];

    output = reducerFunc(output, object[key], key, object);
  }

  return output as O;
}
