import { forwardRef } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

//Other
import classes from './Menu.module.scss';


//The component
const Menu = forwardRef(function Menu({children, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.menu, className)} {...rest} ref={ref}>
        {children}
    </Component>
});

export default Menu;

Menu.defaultProps = {
    component: 'div'
};

Menu.propTypes = {
    component: PropTypes.elementType,
    className: PropTypes.string,
};


const MenuItem = forwardRef(function Item({icon, children, info, subMenu, className, component:Component, ...rest}, ref) {
    return <Component className={classnames(classes.menuItem, className)} {...rest} ref={ref}>
        <span className={classes.icon}>{icon}</span>
        <span className={classes.content}>{children}</span>
        <span className={classes.info}>{info}</span>
        <span className={classes.subMenu}>{subMenu}</span>
    </Component>
});

MenuItem.defaultProps = {
    component: 'div',
};

MenuItem.propTypes = {
    component: PropTypes.elementType,
    className: PropTypes.string,
};

function Divider() {
    return <div className={classes.divider}><span /><span /><span /><span /></div>
}

Menu.Item = MenuItem;
Menu.Divider = Divider;