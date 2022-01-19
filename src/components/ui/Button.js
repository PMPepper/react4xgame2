import styles from './Button.module.scss';

import combineProps from 'helpers/react/combine-props';
import css from 'helpers/css/class-list-to-string';


//The component
export default function Button({theme, ...props}) {
  return <button {...combineProps({
    className: css(styles.btn, theme ? styles[`theme_${theme}`] : null, props.selected && styles.selected),
    type: 'button',
  }, props)} />
}
