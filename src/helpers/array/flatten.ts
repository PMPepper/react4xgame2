import { FlattenRecursive } from 'types/utils';
import add from './add';

export default function flatten<T = any>(...args: (T | T[])[]): FlattenRecursive<T>[] {
  const output = [];

  for(let i = 0; i < args.length; i++) {
    let value = args[i];

    if(value instanceof Array) {
      add(output, flatten.apply(null, value))
    } else {
      output.push(value);
    }
  }

  return output;
}

const x = flatten(1, [2, 3, [4, [5]]])