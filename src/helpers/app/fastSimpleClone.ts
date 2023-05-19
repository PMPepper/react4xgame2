
//Is this faster than just JSON based cloning?

export default function clone<T>(data: T): T {
    switch(typeof(data)) {
      case 'object':
        if(data === null) {
          return null as T;
        } else if(data instanceof Array) {
          const clonedArr = new Array(data.length) as unknown as T;
  
          for(let i = 0, l = data.length; i < l; ++i) {
            clonedArr[i] = clone(data[i]);
          }
  
          return clonedArr as T;
        }
  
        const clonedObj = {} as T;
  
        for(let i = 0, keys = Object.keys(data), l = keys.length; i < l; ++i) {
          let key = keys[i] as keyof T;
  
          clonedObj[key] = clone(data[key]);
        }
  
        return clonedObj
      case 'undefined':
      case 'boolean':
      case 'number':
      case 'string':
        return data;
      case 'function':
      case 'symbol':
      default:
        throw new Error('Cannot clone, unsupported variable type');
    }
  }
  