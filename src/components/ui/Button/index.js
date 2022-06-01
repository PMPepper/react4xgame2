import styles from './Button.module.scss';

import combineProps from 'helpers/react/combine-props';
import css from 'helpers/css/class-list-to-string';
import { forwardRef } from 'react';


//The component
const Button = forwardRef(function Button({theme, ...props}, ref) {
  return <button {...combineProps({
    className: css(styles.btn, theme ? styles[`theme_${theme}`] : null, props.selected && styles.selected),
    type: 'button',
  }, props)} ref={ref} />
});

export default Button;
