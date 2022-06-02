import { createContext, forwardRef, useCallback, useEffect, useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import MenuDisplay from "components/display/Menu";

//Hooks
import useElementPosition from "hooks/useElementPosition";

//Helpers
import combineProps from "helpers/react/combine-props";

//Other
import classes from './Menu.module.scss';
import mergeRefs from "react-merge-refs";

//Consts
// const MenuContext = createContext();
// MenuContext.displayName = 'MenuContext';


//The component
const Menu = forwardRef(function Menu({items, ...rest}, ref) {
    // const onKeyDown = useCallback(
    //     (e) => {
    //         //tab key is ignored
    //         //esc key closes

    //         //if no items selected:
    //             //if enter key, down or right pressed, select first item
    //             //if up key pressed, select last item
    //         //else
    //             //down key selected next item
    //             //up key selects previous item
    //             //left key goes up a level (if applicable)
    //             //right key goes down a level (if applicable)
    //             //enter key clicks item
    //     },
    //     []
    // );

    // const onMouseEnter = useCallback(
    //     (e) => {
            
    //     },
    //     []
    // );

    // const menuProps = useMemo(
    //     () => ({
    //         setSelectedId, 
    //         selectedId
    //     }),
    //     [setSelectedId, selectedId]
    // );

    // const content = useMemo(
    //     () => ({
    //         setSelectedId, 
    //         selectedId
    //     }),
    //     [items]
    // );

    return renderMenu(items);
});

export default Menu;

function renderMenu(items, level = 0) {
    // className={level > 0 ? classes.subMenuWrapper : undefined}

    return <MenuDisplay>
        {items.map((item, i) => {
            if(item === 'div') {
                return <MenuDisplay.Divider key={i} />
            }

            const {label, info, icon, items, onClick} = item;

            return <MenuDisplay.Item
                key={i}
                icon={icon}
                children={label}
                info={info}
                subMenu={items ? 
                    <>
                        <FontAwesomeIcon icon={solid('caret-right')} />
                        <SubMenuWrapper>
                            {renderMenu(items, level+1)}
                        </SubMenuWrapper>
                    </>
                    :
                    null
                }
                onClick={(!items && onClick) || null}
            />
        })}

    </MenuDisplay>
}

Menu.defaultProps = {
    
};

Menu.propTypes = {
    
};


// const Item = forwardRef(function Item({children, icon, info, subMenu, rest}, ref) {
//     const [self, setSelf] = useState();
//     const {selectedId, setSelectedId} = useContext(MenuContext);
//     const id = useId(rest.id, 'menuItem');

//     const isSelected = selectedId === id;

//     const props = useMemo(
//         () => {
//             const calculated = {
//                 className: classNames(classes.menuItem, isSelected && classes.selected),
//                 tabIndex: rest.onClick ? "0" : undefined,
//                 ref: mergeRefs([ref, setSelf]),
//                 id,

//                 onMouseEnter: () => {
//                     setSelectedId(id)
//                 },

//             };

//             return combineProps(calculated, rest);
//         },
//         [rest, ref, setSelf, id, setSelectedId, isSelected]
//     );

//     return <div {...props}>
//         <span className={classes.icon}>{icon}</span>
//         <span className={classes.content}>{children}</span>
//         <span className={classes.info}>{info}</span>
//         <span className={classes.subMenu}>
//             {subMenu ? <>
//                 <FontAwesomeIcon icon={solid('caret-right')} />
//                 <SubMenuWrapper parent={self}>{subMenu}</SubMenuWrapper>
//             </>
//             :
//             null}
//         </span>
//     </div>
// });

const elementSizeOptions = {width: true, height: true, x: true, y: true, getElement: (elem) => elem ? elem.parentElement.parentElement : null};

const SubMenuWrapper = forwardRef(function SubMenuWrapper({children}, ref) {
    const [setElement, position] = useElementPosition(ref, 0, elementSizeOptions);

    //const position = {};
    return <AbsolutelyPositioned fixed ref={setElement} position={position || {}}>{children}</AbsolutelyPositioned>
});
