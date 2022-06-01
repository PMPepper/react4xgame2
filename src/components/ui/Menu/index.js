import { createContext, forwardRef, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import Portal from "components/ui/Portal";

//Hooks
import useElementSize from "hooks/useElementSize";

//Helpers
import combineProps from "helpers/react/combine-props";

//Other
import classes from './Menu.module.scss';

//Consts
const MenuContext = createContext();
MenuContext.displayName = 'MenuContext';


//The component
const Menu = forwardRef(function Menu({children, component: Component, ...rest}, ref) {
    const onKeyDown = useCallback(
        (e) => {
            //tab key is ignored
            //esc key closes

            //if no items selected:
                //if enter key, down or right pressed, select first item
                //if up key pressed, select last item
            //else
                //down key selected next item
                //up key selects previous item
                //left key goes up a level (if applicable)
                //right key goes down a level (if applicable)
                //enter key clicks item
        },
        []
    );
    const onMouseEnter = useCallback(
        (e) => {
            
        },
        []
    );

    const menuProps = useMemo(
        () => ({
            setSelected
        }),
        []
    );

    return <MenuContext.Provider value={menuProps}>
            <Component {...combineProps({className: classes.menu, onKeyDown, onMouseEnter}, rest)} ref={ref}>
            {children}
        </Component>
    </MenuContext.Provider>
});

export default Menu;

Menu.defaultProps = {
    component: 'div'
};

Menu.propTypes = {
    component: PropTypes.elementType
};

function MenuItem({children, icon, info, selected, ...rest}) {
    return <div {...combineProps({className: classes.menuItem, tabIndex: rest.onClick ? "0" : undefined}, rest)}>
        <span className={classes.icon}>{icon}</span>
        <span className={classes.content}>{children}</span>
        <span className={classes.info}>{info}</span>
        <span className={classes.subMenu}></span>
    </div>
}

function MenuSubItems({children, icon, info, subMenu}) {
    const [self, setSelf] = useState();

    return <div className={classes.menuItem} tabIndex="0" ref={setSelf}>
        <span className={classes.icon}>{icon}</span>
        <span className={classes.content}>{children}</span>
        <span className={classes.info}>{info}</span>
        <span className={classes.subMenu}>
            <FontAwesomeIcon icon={solid('caret-right')} />
            <SubMenuWrapper parent={self}>{subMenu}</SubMenuWrapper>
        </span>

    </div>
}

function Divider() {
    return <div className={classes.divider}><span /><span /><span /><span /></div>
}

const SubMenuWrapper = forwardRef(function SubMenuWrapper({children, parent}, ref) {
    const [setElement, position] = useElementSize(null, 0, {width: true, height: true, x: true, y: true});

    useEffect(
        () =>setElement(parent),
        [parent]
    );

    return <AbsolutelyPositioned fixed ref={ref} position={position}>{children}</AbsolutelyPositioned>
});

Menu.Item = MenuItem;
Menu.Divider = Divider;
Menu.SubItems = MenuSubItems;