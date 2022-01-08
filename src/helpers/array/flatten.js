import add from './add';

export default function flatten() {
  const output = [];

  for(let i = 0; i < arguments.length; i++) {
    let value = arguments[i];

    if(value instanceof Array) {
      add(output, flatten.apply(null, value))
    } else {
      output.push(value);
    }
  }

  return output;
}
