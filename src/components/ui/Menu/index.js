import { useRef, forwardRef, useCallback, useEffect, useMemo } from "react";
//import PropTypes from "prop-types";
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
                default:
                    return;
                    
            }

            e.preventDefault();
            e.stopPropagation();
        }
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
        []
    );

    const onMouseLeave = useCallback(
        (e) => {
            const dataset = e.currentTarget.dataset;

            dispatch({type: 'mouseLeave', payload: {index: +dataset.menuIndex, level: +dataset.menuLevel}});
        },
        []
    );

    const itemProps = useMemo(
        () => ({
            onMouseEnter,
            onMouseLeave,
            tabIndex: '0',
        }),
        []
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
        []
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

                role={!hasChildren && onClick ? "button" : undefined}
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

Menu.defaultProps = {
    
};

Menu.propTypes = {
    
};

export const DividerName = Menu.DividerName = 'divider';

const elementSizeOptions = {width: true, height: true, x: true, y: true, getElement: (elem) => elem ? elem.parentElement.parentElement : null};

const SubMenuWrapper = forwardRef(function SubMenuWrapper({children}, ref) {
    const [setElement, position] = useElementPosition(ref, 0, elementSizeOptions);

    return <AbsolutelyPositioned fixed ref={setElement} positionRelativeTo={position}>{children}</AbsolutelyPositioned>
});
