
//Is this faster than just JSON based cloning?

export default function clone(data) {
    switch(typeof(data)) {
      case 'object':
        if(data === null) {
          return null;
        } else if(data instanceof Array) {
          const clonedArr = new Array(data.length);
  
          for(let i = 0, l = data.length; i < l; ++i) {
            clonedArr[i] = clone(data[i]);
          }
  
          return clonedArr;
        }
  
        const clonedObj = {};
  
        for(let i = 0, keys = Object.keys(data), l = keys.length; i < l; ++i) {
          let key = keys[i];
  
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
  