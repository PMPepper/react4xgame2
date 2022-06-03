import { useRef, forwardRef, useCallback, useEffect, useState, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import mergeRefs from "react-merge-refs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import MenuDisplay from "components/display/Menu";

//Hooks
import useElementPosition from "hooks/useElementPosition";
import useRefCallback from "hooks/useRefCallback";

//Helpers
import combineProps from "helpers/react/combine-props";

//Other
import classes from './Menu.module.scss';

import { e } from "mathjs";
import { getNextKeyDef } from "@testing-library/user-event/dist/keyboard/getNextKeyDef";

//Consts
// const MenuContext = createContext();
// MenuContext.displayName = 'MenuContext';


//The component
const Menu = forwardRef(function ({items, ...rest}, ref) {
    //state
    const rootElemRef = useRef();
    const [level, setLevel] = useState(0);
    const [selected, setSelected] = useState([]);
    const [openAtLevel, setOpenAtLevel] = useState([]);

    //callbacks
    const selectNext = useRefCallback(() => {
        const curSelected = selected[level];

        console.log('selectNext, ', curSelected, level);

        if((curSelected ?? false) === false) {
            selectFirst();
        } else {
            const levelItems = getLevelItems(items, selected, level);

            const newSelectedIndex = levelItems.findIndex((item, index) => {
                console.log(item, index);
                return (index > curSelected) && (item !== Menu.DividerName);
            })
            console.log(newSelectedIndex);
            if(newSelectedIndex === -1) {
                selectFirst()
            } else {
                setSelectedItem(newSelectedIndex, level);
            }
        }
    });

    const selectPrev = useRefCallback(() => {
        const curSelected = selected[level];

        console.log('selectPrev, ', curSelected, level);

        if((curSelected ?? false) === false) {
            selectLast();
        } else {
            const levelItems = getLevelItems(items, selected, level);

            const newSelectedIndex = levelItems.findLastIndex((item, index) => {
                console.log(item, index);
                return (index < curSelected) && (item !== Menu.DividerName);
            })

            console.log(newSelectedIndex);
            if(newSelectedIndex === -1) {
                selectLast()
            } else {
                setSelectedItem(newSelectedIndex, level);
            }
        }        
    });

    const selectFirst = useRefCallback(() => {
        console.log('selectFirst');
        const levelItems = getLevelItems(items, selected, level);

        const newSelectedIndex = levelItems.findIndex((item, index) => {
            return item !== Menu.DividerName;
        })

        if(newSelectedIndex !== -1) {
            setSelectedItem(newSelectedIndex, level);
        } else {
            setSelectedItem(null, level);
        }
    });

    const selectLast = useRefCallback(() => {
        console.log('selectLast');

        const levelItems = getLevelItems(items, selected, level);

        const newSelectedIndex = levelItems.findLastIndex((item, index) => {
            return item !== Menu.DividerName;
        })

        if(newSelectedIndex !== -1) {
            setSelectedItem(newSelectedIndex, level);
        } else {
            setSelectedItem(null, level);
        }
    });

    const openSubmenu = useRefCallback(() => {
        
    });

    const closeSubmenu = useRefCallback(() => {

    });

    const onKeyDown = useCallback(
        (e) => {
            console.log('Menu::onKeyDown('+e.which+')');
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
            
            switch(e.which) {
                case 9://Tab
                    break;//TODO ignore
                case 13://Enter
                    break;//TODO click item
                case 40:
                    selectNext();
                    break;
                case 38:
                    selectPrev();
                    break;
                case 39://right
                    openSubmenu();
                    selectFirst();
                    break;//TODO
                case 37://left
                    closeSubmenu();
                    break;//TODO
                default:
                    return;
                    
            }

            e.preventDefault();
            e.stopPropagation();
        },
        []
    );

    const setSelectedItem = useCallback(
        (index, level) => {
            console.log('setSelectedItem ', index, level);
            setSelected(curSelected => ([...curSelected.slice(0, level), index]))
        },
        []
    );

    const setRootElem = useCallback(
        (elem) => {
            //need to delay setting focus for some reason
            elem && setTimeout(() => {elem.focus()}, 0);
            rootElemRef.current = elem;
        },
        []
    );

    // const onMouseEnter = useCallback(
    //     (e) => {
            
    //     },
    //     []
    // );

    const menuProps = useMemo(
        () => ({
            onKeyDown, 
            tabIndex: 0,
            ref: mergeRefs([ref, setRootElem])
        }),
        []
    );

    // const content = useMemo(
    //     () => ({
    //         setSelectedId, 
    //         selectedId
    //     }),
    //     [items]
    // );

    return renderMenu(items, 0, level, selected, menuProps, setSelectedItem);
});

Menu.displayName = 'Menu';

export default Menu;

//Internal helpers
function getLevelItems(items, selected, level, curLevel = 0) {
    if(level === curLevel) {
        return items
    }

    return getLevelItems(items[selected[curLevel]].items, level, curLevel+1);
}

function renderMenu(items, level, selectedLevel, selected, menuProps, setSelectedItem) {
    const itemSelectedAtThisLevel = selected[level];

    return <MenuDisplay {...menuProps}>
        {items.map((item, i) => {
            if(item === Menu.DividerName) {
                return <MenuDisplay.Divider key={i} />
            }

            const isSelected = itemSelectedAtThisLevel === i;
            const {label, info, icon, items, onClick} = item;

            return <MenuDisplay.Item
                selected={isSelected}
                key={i}
                icon={icon}
                children={label}
                info={info}
                subMenu={items && items.length > 0 ? //TODO separate selected from open
                    <>
                        <FontAwesomeIcon icon={solid('caret-right')} />
                        {false && <SubMenuWrapper>
                            {renderMenu(items, level+1, selectedLevel, selected, null, setSelectedItem)}
                        </SubMenuWrapper>}
                    </>
                    :
                    null
                }

                onClick={(!items && onClick) || null}
                onMouseEnter={() => setSelectedItem(i, level)}
            />
        })}

    </MenuDisplay>
}

Menu.defaultProps = {
    
};

Menu.propTypes = {
    
};

Menu.DividerName = 'divider';

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

    return <AbsolutelyPositioned fixed ref={setElement} positionRelativeTo={position}>{children}</AbsolutelyPositioned>
});
