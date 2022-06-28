
//utils
import classnames from 'helpers/css/class-list-to-string';
import { Children } from 'react';

//Other
import classes from './IconStack.module.scss';


//The component
export default function IconStack({children, className, ...props}) {
    const childArray = Children.toArray(children);

    return <span className={classnames(classes.iconStack, className)} {...props}>
        {childArray[0]}
        {children}
    </span>
}