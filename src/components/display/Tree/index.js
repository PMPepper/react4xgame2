import { forwardRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

//Other
import classes from './Tree.module.scss';


//The component
const Tree = forwardRef(function Tree({component: Component, className, children, ...rest}, ref) {
    
    return <Component className={classNames(classes.tree, className)} {...rest} ref={ref}>{children}</Component>
});

Tree.defaultProps = {
    component: 'div',
    role: "tree",
    tabIndex: 0,
};

Tree.propTypes = {
    component: PropTypes.elementType,
    role: PropTypes.string,
};

export default Tree;


Tree.Group = forwardRef(function Tree({component: Component, className, children, ...rest}, ref) {
    
    return <Component className={classNames(classes.group, className)} {...rest} ref={ref}>{children}</Component>
});

Tree.Group.defaultProps = {
    component: 'ul',
    role: "presentational",
};

Tree.Group.propTypes = {
    component: PropTypes.elementType,
    role: PropTypes.string,
};


Tree.Item = forwardRef(function Tree({component: Component, className, children, ...rest}, ref) {
    
    return <Component className={classNames(classes.item, className)} {...rest} ref={ref}>{children}</Component>
});

Tree.Item.defaultProps = {
    component: 'li',
    role: "treeitem",
    tabIndex: -1
};

Tree.Item.propTypes = {
    component: PropTypes.elementType,
    role: PropTypes.string,
};