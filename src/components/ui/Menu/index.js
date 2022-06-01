import { createContext, forwardRef, useCallback, useEffect, useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import classNames from "classnames";

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import Portal from "components/ui/Portal";

//Hooks
import useElementSize from "hooks/useElementSize";
import useId from "hooks/useId";

//Helpers
import combineProps from "helpers/react/combine-props";

//Other
import classes from './Menu.module.scss';
import mergeRefs from "react-merge-refs";

//Consts
const MenuContext = createContext();
MenuContext.displayName = 'MenuContext';


//The component
const Menu = forwardRef(function Menu({children, component: Component, ...rest}, ref) {
    const [selectedId, setSelectedId] = useState();

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
            setSelectedId, 
            selectedId
        }),
        [setSelectedId, selectedId]
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

function MenuItem({children, icon, info, ...rest}) {
    return <Item children={children} icon={icon} info={info} rest={rest} />
}

function MenuSubItems({children, icon, info, subMenu, ...rest}) {
    return <Item children={children} icon={icon} info={info} rest={rest} subMenu={subMenu} />
}

const Item = forwardRef(function Item({children, icon, info, subMenu, rest}, ref) {
    const [self, setSelf] = useState();
    const {selectedId, setSelectedId} = useContext(MenuContext);
    const id = useId(rest.id, 'menuItem');

    const isSelected = selectedId === id;

    const props = useMemo(
        () => {
            const calculated = {
                className: classNames(classes.menuItem, isSelected && classes.selected),
                tabIndex: rest.onClick ? "0" : undefined,
                ref: mergeRefs([ref, setSelf]),
                id,

                onMouseEnter: () => {
                    setSelectedId(id)
                },

            };

            return combineProps(calculated, rest);
        },
        [rest, ref, setSelf, id, setSelectedId, isSelected]
    );

    return <div {...props}>
        <span className={classes.icon}>{icon}</span>
        <span className={classes.content}>{children}</span>
        <span className={classes.info}>{info}</span>
        <span className={classes.subMenu}>
            {subMenu ? <>
                <FontAwesomeIcon icon={solid('caret-right')} />
                <SubMenuWrapper parent={self}>{subMenu}</SubMenuWrapper>
            </>
            :
            null}
        </span>
    </div>
});

function Divider() {
    return <div className={classes.divider}><span /><span /><span /><span /></div>
}

const SubMenuWrapper = forwardRef(function SubMenuWrapper({children, parent}, ref) {
    const [setElement, position] = useElementSize(null, 0, {width: true, height: true, x: true, y: true});

    useEffect(
        () =>setElement(parent),
        [parent]
    );

    return <AbsolutelyPositioned fixed ref={ref} position={position}><div className={classes.subMenuWrapper}>{children}</div></AbsolutelyPositioned>
});

Menu.Item = MenuItem;
Menu.Divider = Divider;
Menu.SubItems = MenuSubItems;