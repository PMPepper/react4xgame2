import { forwardRef } from "react";
import PropTypes from 'prop-types';

//Helpers
import combineProps from "helpers/react/combine-props";
import classnames from "helpers/css/class-list-to-string";

//Other
import classes from './Overflow.module.scss';


//The component
const Overflow = forwardRef(function Overflow({horizontal, vertical, children, component: Component, ...rest}, ref) {
    const props = combineProps(
        {
            className: classnames(horizontal && classes.horizontal, vertical && classes.vertical),
            ref
        },
        rest
    );
    
    return <Component {...props}>
        {children}
    </Component>
});

export default Overflow;

Overflow.defaultProps = {
    vertical: true,
    horizontal: false,
    component: 'div',
};

Overflow.propTypes = {
    vertical: PropTypes.bool,
    horizontal: PropTypes.bool,
    component: PropTypes.elementType,
}