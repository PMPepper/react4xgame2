//TODO lots, including:
//keyboard navigation
//scroll to keep selected item in view?
//add tooltip for truncated items? or do that at the items building level?
//performance?

import { forwardRef, useMemo, useCallback } from 'react';
import PropTypes from "prop-types";
import { isEqual } from 'lodash';

//Components
import TreeDisplay from 'components/display/Tree';

//Prop types
import isPositiveInteger from 'prop-types/is-positive-integer';

//Hooks
import useTree, {getPathName} from './reducer';
import useId from 'hooks/useId';

//Other
import classes from 'components/display/Tree/Tree.module.scss';


//The component
const Tree = forwardRef(function Tree({items, selectedItem, setSelectedItem, id, ...rest}, ref) {
    id = useId(id, 'tree');
    const [state, dispatch] = useTree(items);

    const content = useMemo(
        () => renderTree(id, items, selectedItem, setSelectedItem, dispatch, state.expanded),
        [items, dispatch, state.expanded, selectedItem, setSelectedItem, id]
    );

    const onKeyDown = useCallback(
        (e) => {
            switch(e.which) {
                case 38: {//Up
                    selectPrevItem(selectedItem, setSelectedItem, state);
                    break;
                }
                case 40: {//Down
                    selectNextItem(selectedItem, setSelectedItem, state);
                    break;
                }
                case 37: {//Left
                    dispatch({type: 'collapseSelected', payload: selectedItem});
                    break;
                }
                case 39: {//Right
                    dispatch({type: 'expandSelected', payload: selectedItem})
                    break;
                }
                case 36: {//Home
                    selectFirstItem(setSelectedItem, state);
                    break;
                }
                case 35: {//End
                    selectLastItem(setSelectedItem, state);
                    break;
                }
                //type characters (move focus to item matching typed characters)
                default:
                    const key = e.key.trim();

                    if(key.length === 1) {
                        const treeElem = e.currentTarget;

                        const textContent = getVisibleItemsTextContent(treeElem);
                        
                        //TODO
                        break;
                    }

                    return;
            }

            e.preventDefault();
            e.stopPropagation();
        },
        [selectedItem, state]
    )
    
    return <TreeDisplay {...rest} onKeyDown={onKeyDown} id={id} ref={ref}>
        {content}
    </TreeDisplay>
});

export default Tree;

Tree.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.node,
            label: PropTypes.node.isRequired,
            expanded: PropTypes.bool,
            items: PropTypes.array//PropTypes doesn't really deal with nested datastructures
        })
    ),
    selectedItem: PropTypes.arrayOf(isPositiveInteger),
    setSelectedItem: PropTypes.func
}


function renderTree(rootId, items, selectedItem, setSelectedItem, dispatch, expanded, path = []) {
    const selectedItemPathName = selectedItem?.length ? getPathName(selectedItem) : null;
    return <TreeDisplay.Group>
        {items.map(({icon, label, items}, index) => {
            const newPath = [...path, index];
            const pathName = getPathName(newPath);
            const hasChildren = items?.length > 0;
            const isSelected = selectedItem?.length && (pathName === selectedItemPathName);

            return <TreeDisplay.Item
                key={index}
                icon={icon}
                label={label}
                children={hasChildren && expanded[pathName] ? renderTree(rootId, items, selectedItem, setSelectedItem, dispatch, expanded, newPath) : undefined}

                aria-selected={isSelected ? "true" : undefined}
                aria-expanded={hasChildren ? (expanded[pathName] ? "true" : "false") : undefined}
                aria-level={newPath.length}
                data-tree={rootId}
                data-tree-path={pathName}

                onExpandClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch({type: 'onExpandClick', payload: newPath})
                }}
                onClick={setSelectedItem ? () => {
                    setSelectedItem(newPath);
                } : null}
            />
        })}
    </TreeDisplay.Group>
}


function selectNextItem(selectedItem, setSelectedItem, {items, expanded}) {
    const allVisibleItems = getAllVisibleItems(items, expanded);
    const selectedIndex = allVisibleItems.findIndex(path => isEqual(path, selectedItem));

    if(selectedIndex === -1 || selectedIndex === allVisibleItems.length - 1) {
        setSelectedItem(allVisibleItems[0]);
    } else {
        setSelectedItem(allVisibleItems[selectedIndex + 1]);
    }

}

function selectPrevItem(selectedItem, setSelectedItem, {items, expanded}) {
    const allVisibleItems = getAllVisibleItems(items, expanded);
    const selectedIndex = allVisibleItems.findIndex(path => isEqual(path, selectedItem));

    if(selectedIndex === -1 || selectedIndex === 0) {
        setSelectedItem(allVisibleItems[allVisibleItems.length - 1]);
    } else {
        setSelectedItem(allVisibleItems[selectedIndex - 1]);
    }
}

function selectFirstItem(setSelectedItem, {items, expanded}) {
    const allVisibleItems = getAllVisibleItems(items, expanded);

    setSelectedItem(allVisibleItems[0]);
}

function selectLastItem(setSelectedItem, {items, expanded}) {
    const allVisibleItems = getAllVisibleItems(items, expanded);

    setSelectedItem(allVisibleItems[allVisibleItems.length - 1]);
}

//TODO maintain allVisibleItems list at all times...?
function getAllVisibleItems(items, expanded, path = []) {
    const visibleItems = [];

    items.forEach((item, index) => {
        const newPath = [...path, index];
        visibleItems.push(newPath);

        if(item?.length > 0 && expanded[getPathName(newPath)]) {
            visibleItems.push(...getAllVisibleItems(item, expanded, newPath));
        }
    })

    return visibleItems;
}

function getVisibleItemsTextContent(treeElem) {
    const items = Array.from(treeElem.querySelectorAll(`[data-tree="${treeElem.id}"][role="treeitem"]`));

    const itemContent = items.reduce((output, item) => {
        output[item.dataset.treePath] = Array.from(item.children).find(child => child.matches(`.${classes.itemLabel}`))?.textContent.trim();

        return output;
    }, {})

    console.log(itemContent);

    return itemContent;
}