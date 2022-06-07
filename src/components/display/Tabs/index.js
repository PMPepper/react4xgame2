import { forwardRef } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

//Other
import classes from './Tabs.module.scss';


//The components
const Tabs = forwardRef(function Tabs({children, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tabs, className)} {...rest} ref={ref}>
        {children}
    </Component>
});

export default Tabs;

Tabs.defaultProps = {
    component: 'div'
};

Tabs.propTypes = {
    className: PropTypes.string
};


Tabs.Tab = forwardRef(function Tabs({children, selected, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tab, className, selected && classes.selected)} {...rest} ref={ref}>
        {children}
    </Component>
});

Tabs.Tab.defaultProps = {
    selected: false,
    component: 'button',
    type: 'button'
};

Tabs.Tab.propTypes = {
    selected: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.string,
};


Tabs.TabsList = forwardRef(function Tabs({children, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tabsList, className)} {...rest} ref={ref}>
        {children}
    </Component>
});

Tabs.TabsList.defaultProps = {
    component: 'div'
};

Tabs.TabsList.propTypes = {
    className: PropTypes.string
};


Tabs.TabContent = forwardRef(function Tabs({children, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tabContent, className)} {...rest} ref={ref}>
        {children}
    </Component>
});

Tabs.TabContent.defaultProps = {
    component: 'div'
};

Tabs.TabContent.propTypes = {
    className: PropTypes.string
};