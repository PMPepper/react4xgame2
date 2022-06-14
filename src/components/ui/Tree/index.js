//TODO lots, including:
//selected item
//keyboard navigation

import { forwardRef, useMemo } from 'react';
import PropTypes from "prop-types";

//Components
import TreeDisplay from 'components/display/Tree';

//Prop types
import isPositiveInteger from 'prop-types/is-positive-integer';

//Hooks
import useTree, {getPathName} from './reducer';


//The component
const Tree = forwardRef(function Tree({items, selectedItem, setSelectedItem, ...rest}, ref) {
    const [state, dispatch] = useTree(items);

    const content = useMemo(
        () => renderTree(items, dispatch, state.expanded),
        [items, dispatch, state.expanded]
    );
    
    return <TreeDisplay {...rest} ref={ref}>
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


function renderTree(items, dispatch, expanded, path = []) {
    return <TreeDisplay.Group>
        {items.map(({icon, label, items}, index) => {
            const hasChildren = items?.length > 0;
            const newPath = [...path, index]

            return <TreeDisplay.Item
                key={index}
                icon={icon}
                label={label}
                children={hasChildren ? renderTree(items, dispatch, expanded, newPath) : undefined}

                aria-expanded={hasChildren ? (expanded[getPathName(newPath)] ? "true" : "false") : undefined}
                aria-level={newPath.length}

                onExpandClick={() => dispatch({type: 'onExpandClick', payload: newPath})}
            />
        })}
    </TreeDisplay.Group>
}

