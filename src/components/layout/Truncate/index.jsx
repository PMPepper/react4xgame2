//TODO multiline support?
import { forwardRef } from "react";
import PropTypes from 'prop-types';

//Helpers
import combineProps from "helpers/react/combine-props";

//Other
import classes from './Truncate.module.scss';


//The component
const Truncate = forwardRef(function Truncate({children, component: Component, ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.truncate,
            ref
        },
        rest
    );

    return <Component {...props}>
        {children}
    </Component>;
});

export default Truncate;

Truncate.defaultProps = {
    component: 'span',
};

Truncate.propTypes = {
    component: PropTypes.elementType,
}