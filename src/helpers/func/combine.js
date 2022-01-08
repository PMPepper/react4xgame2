import add from '@/helpers/array/add';

export default function combine() {
  const args = [];

  //build array of functions from arguments
  for(let i = 0, l = arguments.length; i < l; i++) {
    let arg = arguments[i];

    if(arg instanceof Function) {

      if(arg[combinedFuncIdentifierPropName] === combinedFuncIdentifier && arg[combinedFuncArgsPropName]) {
        add(args, arg[combinedFuncArgsPropName]);
      } else {
        args.push(arg);
      }
    }
  }

  if(args.length === 0) {
    return noop;
  }

  if(args.length === 1) {
    return args[0];
  }

  Object.freeze(args);

  const combineFunc = function() {
    return args.map(func => (func.apply(this, arguments)))
  }

  //Mark function so it can be combined later
  //-not really necessary, just me being clever for the sake of it..
  Object.defineProperty(combineFunc, combinedFuncIdentifierPropName, {
    value: combinedFuncIdentifier,
    writable: false
  });

  Object.defineProperty(combineFunc, combinedFuncArgsPropName, {
    value: args,
    writable: false
  });

  return combineFunc;
}

function noop() {}

const combinedFuncArgsPropName = '__isCombinedFuncArgs_';
const combinedFuncIdentifierPropName = '__isCombinedFunc_';
const combinedFuncIdentifier = Object.freeze({});
