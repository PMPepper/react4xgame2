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


Tabs.Tab = forwardRef(function Tab({children, selected, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tab, className, selected && classes.selected)} {...rest} aria-selected={selected ? "true" : "false"} ref={ref}>
        {children}
    </Component>
});

Tabs.Tab.defaultProps = {
    selected: false,
    component: 'button',
    type: 'button',
    tabIndex: -1,
    role: "tab",
};

Tabs.Tab.propTypes = {
    selected: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.string,
    tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};


Tabs.TabsList = forwardRef(function TabsList({children, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tabsList, className)} {...rest} ref={ref}>
        {children}
    </Component>
});

Tabs.TabsList.defaultProps = {
    component: 'div',
    role: "tablist"
};

Tabs.TabsList.propTypes = {
    className: PropTypes.string,
    tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};


Tabs.TabContents = forwardRef(function TabContents({children, component: Component, className, ...rest}, ref) {
    return <Component className={classnames(classes.tabContents, className)} {...rest} ref={ref}>
        {children}
    </Component>
});

Tabs.TabContents.defaultProps = {
    component: 'div'
};

Tabs.TabContents.propTypes = {
    className: PropTypes.string
};


Tabs.TabContent = forwardRef(function TabContent({children, component: Component, className, selected, ...rest}, ref) {
    return <Component inert={selected ? undefined : "inert"} className={classnames(classes.tabContent, className, selected && classes.selected)} {...rest} ref={ref}>
        {children}
    </Component>
});

Tabs.TabContent.defaultProps = {
    selected: false,
    component: 'div',
    role: "tabpanel",
};

Tabs.TabContent.propTypes = {
    selected: PropTypes.bool,
    className: PropTypes.string
};