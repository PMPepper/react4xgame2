import { useRef, forwardRef, useCallback, useEffect, useMemo } from "react";
import PropTypes from 'prop-types'
import mergeRefs from "react-merge-refs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import MenuDisplay from "components/display/Menu";

//Hooks
import useElementPosition from "hooks/useElementPosition";
import useId from "hooks/useId";

//Other
import useMenuState from './reducer';
import findAncestor from "helpers/dom/find-ancestor";


//The component
const Menu = forwardRef(function ({items, id, ...rest}, ref) {
    id = useId(id, 'menu');

    const [{itemsSelectedAtLevel, itemsOpenAtLevel}, dispatch] = useMenuState(items);

    useEffect(//keep focus updated based on selected item
        () => {
            const {current: rootElem} = rootElemRef

            if(itemsSelectedAtLevel.length > 0) {
                document.getElementById(getItemId(id, ...itemsSelectedAtLevel))?.focus();
            } else {
                console.log('focus on root');
                rootElem?.focus();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [itemsSelectedAtLevel]
    )

    //other state
    const rootElemRef = useRef();

    const onKeyDown = useCallback(
        (e) => {
            switch(e.which) {
                case 9://Tab
                    break;//ignore
                case 13://Enter
                    document.activeElement.click();//click item
                    break;
                case 40://Down
                    dispatch({type: 'keyboardDown'});
                    break;
                case 38://Up
                    dispatch({type: 'keyboardUp'});
                    break;
                case 39: {//right
                    dispatch({type: 'keyboardRight'});
                    break;
                }
                case 37: {//left
                    dispatch({type: 'keyboardLeft'});
                    break;
                }
                case 36: {//Home
                    dispatch({type: 'keyboardHome'});
                    break;
                }
                case 35: {//End
                    dispatch({type: 'keyboardEnd'});
                    break;
                }
                
                default: {
                    const key = e.key.trim();

                    if(key.length === 1) {
                        //any character key - move to next item starting with that key (if none, does not move) (elem.textContent.charAt(0).toLowerCase())
                        //state doesn't have access to first character
                        
                        const elem = document.activeElement;
                        const menuElem = findAncestor(elem, '[role="menu"]');//TODO needs to be deepest menu
                        

                        if(menuElem) {
                            const deepestMenu = menuElem.querySelector('[role="menu"]') || menuElem;
                            const firstLetters = Array.from(deepestMenu.children).map(e => e.textContent.trim().charAt(0).toLowerCase());

                            dispatch({type: 'keyboardKey', payload: {key, firstLetters}});
                        }
                        break;
                    }

                    return;
                }
            }

            e.preventDefault();
            e.stopPropagation();
        },
        [dispatch]
    );

    const setRootElem = useCallback(
        (elem) => {
            //need to delay setting focus for some reason
            elem && setTimeout(() => {
                elem.focus();
            }, 0);
            rootElemRef.current = elem;
        },
        []
    );

    const onMouseEnter = useCallback(
        (e) => {
            const dataset = e.currentTarget.dataset;

            dispatch({type: 'mouseEnter', payload: {index: +dataset.menuIndex, level: +dataset.menuLevel}});
        },
        [dispatch]
    );

    const onMouseLeave = useCallback(
        (e) => {
            const dataset = e.currentTarget.dataset;

            dispatch({type: 'mouseLeave', payload: {index: +dataset.menuIndex, level: +dataset.menuLevel}});
        },
        [dispatch]
    );

    const itemProps = useMemo(
        () => ({
            onMouseEnter,
            onMouseLeave,
            tabIndex: '0',
        }),
        [onMouseEnter, onMouseLeave]
    );

    const menuProps = useMemo(
        () => ({
            onKeyDown, 
            onMouseLeave: (e) => dispatch({type: 'mouseLeaveMenu'}),
            onContextMenu: (e) => {e.preventDefault(); e.stopPropagation();},
            tabIndex: 0,
            id,
            ref: mergeRefs([ref, setRootElem])
        }),
        [dispatch, id, onKeyDown, ref, setRootElem]
    );

    return renderMenu(items, [], 0, itemsSelectedAtLevel, itemsOpenAtLevel, menuProps, id, itemProps, dispatch);
});

Menu.displayName = 'Menu';

export default Menu;

//Internal helpers
function getItemId(rootId, ...path) {
    return `${rootId}${path.map(i => `[${i}]`).join('')}`;
}

function renderMenu(items, path, selectedLevel, itemsSelectedAtLevel, itemsOpenAtLevel, menuProps, rootId, itemProps, dispatch) {
    const level = path.length;
    const itemSelectedAtThisLevel = itemsSelectedAtLevel[level];

    return <MenuDisplay {...menuProps}>
        {items.map((item, i) => {
            if(item === Menu.DividerName) {
                return <MenuDisplay.Divider key={i} />
            }

            const isSelected = itemSelectedAtThisLevel === i;
            const {label, info, icon, items, onClick} = item;
            const hasChildren = items?.length > 0;

            return <MenuDisplay.Item
                id={getItemId(rootId, ...path, i)}
                selected={isSelected}
                key={i}
                icon={icon}
                children={label}
                info={info}
                subMenu={items && items.length > 0 ?
                    <>
                        <FontAwesomeIcon icon={solid('caret-right')} />
                        {(itemsOpenAtLevel[level] === i) && <SubMenuWrapper>
                            {renderMenu(items, [...path, i], selectedLevel, itemsSelectedAtLevel, itemsOpenAtLevel, null, rootId, itemProps, dispatch)}
                        </SubMenuWrapper>}
                    </>
                    :
                    null
                }

                role="menuitem"//{!hasChildren && onClick ? "button" : undefined}
                onClick={hasChildren ?
                    (e) => {
                        const dataset = e.currentTarget.dataset;

                        dispatch({type: 'openMenu', payload: {index: +dataset.menuIndex, level: +dataset.menuLevel}});

                        e.preventDefault();
                        e.stopPropagation();
                     }
                     :
                     onClick
                }

                data-menu-index={i}
                data-menu-level={level}

                {...itemProps}
            />
        })}

    </MenuDisplay>
}


Menu.propTypes = {
    id: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.string,//TODO specific value = DividerName

        PropTypes.shape({
            label: PropTypes.node.isRequired,
            icon: PropTypes.node,
            info: PropTypes.node,
            onClick: PropTypes.function
        }),

        PropTypes.shape({
            label: PropTypes.node.isRequired,
            icon: PropTypes.node,
            info: PropTypes.node,
            items: PropTypes.array//TODO ideally would enfoce recursively, but proptypes not designed for that
        })
    ]))
};

export const DividerName = Menu.DividerName = 'divider';

const elementSizeOptions = {width: true, height: true, x: true, y: true, getElement: (elem) => elem ? elem.parentElement.parentElement : null};

const SubMenuWrapper = forwardRef(function SubMenuWrapper({children}, ref) {
    const [setElement, position] = useElementPosition(ref, 0, elementSizeOptions);

    return <AbsolutelyPositioned fixed ref={setElement} positionRelativeTo={position}>{children}</AbsolutelyPositioned>
});
