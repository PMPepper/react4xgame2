export default function deepFreeze<T>(obj: T): Readonly<T> {
    Object.keys(obj).forEach(prop => {
      if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
        deepFreeze(obj[prop]);
      }
    });
    
    return Object.freeze(obj);
};