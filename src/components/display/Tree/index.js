import { forwardRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Other
import classes from './Tree.module.scss';

//Consts
const openedIcon = <FontAwesomeIcon icon={solid("caret-down")} />;
const closedIcon = <FontAwesomeIcon icon={solid("caret-right")} />;


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


Tree.Item = forwardRef(function Tree({component: Component, className, icon, label, children, onExpandClick, hideIcon, ...rest}, ref) {
    const expanded = rest['aria-expanded'];
    
    return <Component className={classNames(classes.itemWrapper)} ref={ref}>
        <div className={classNames(classes.item, className)} {...rest} role="treeitem" tabIndex="-1">
            <span className={classes.itemNavIcon} onClick={onExpandClick}>
                {expanded === "true" && openedIcon}
                {expanded === "false" && closedIcon}
            </span>
            {!hideIcon && <span className={classes.itemIcon} aria-hidden="true">{icon}</span>}
            <span className={classes.itemLabel}>{label}</span>
        </div>
        {children}
    </Component>
});

Tree.Item.defaultProps = {
    component: 'li',
    role: "presentational",
    hideIcon: false,
};

Tree.Item.propTypes = {
    component: PropTypes.elementType,
    role: PropTypes.string,
    icon: PropTypes.node,
    label: PropTypes.node.isRequired,
    hideIcon: PropTypes.bool,
};