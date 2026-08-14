//TODO optional spacing with parameter?

import { forwardRef } from "react"

//Helpers
import combineProps from "helpers/react/combine-props";
import classes from './Stack.module.scss';


//The component
const Stack = forwardRef(function Stack({children, component: Component = 'div', ...rest}, ref) {
    const props = combineProps(
        {
            className: classes.stack,
            ref
        },
        rest
    );

    return <Component {...props}>
        {children}
    </Component>
});

export default Stack