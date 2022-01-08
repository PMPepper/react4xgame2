import combine from '@/helpers/func/combine';
import css from '@/helpers/css/class-list-to-string';

//TODO handle special props like className (concatenate)

export default function combineProps() {
  const props = {};

  for(let i = 0, l = arguments.length; i < l; ++i) {
    const addProps = arguments[i];

    if(addProps) {//This argument is an object
      for(let i2 = 0, keys = Object.keys(addProps), kl = keys.length; i2 < kl; ++i2) {
        let key = keys[i2];
        let value = addProps[key];

        if(value instanceof Function) {
          value = combine(props[key], value);
        }

        switch(key) {
          case 'className':
            props[key] = css(props[key], value);
            break;
          case 'style':
            props[key] = {...props[key], ...value};
            break;
          default:
            props[key] = value
        }
      }
    }
  }

  return props;
}
