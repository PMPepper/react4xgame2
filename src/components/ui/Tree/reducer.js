import { useReducer, useEffect, useRef } from "react";



const initialState = {
    items: null,
    expanded: null,
};


export default function useTree(items) {
    const firstTimeRef = useRef(true);

    //init reducer
    const [state, dispatch] = useReducer(reducer, initialState, (initialState) => ({
        ...initialState,
        ...normaliseItemsForState(items, {}),
    }));

    //keeps state updated with items
    useEffect(
        () => {
            if(firstTimeRef.current) {//skip the first time
                firstTimeRef.current = false;
            } else {
                dispatch({type: 'updateItems', payload: normaliseItemsForState(items).items});
            }
        },
        [items]
    );

    return [state, dispatch];
}

function reducer(state, {type, payload}) {
    console.log('[TS]: ', type, payload);
    switch(type) {
        //General events
        case 'updateItems': {
            return {
                ...state,
                items: payload
            }
        }

        //Keyboard events
        case 'collapseSelected': {
            return expandOrCollapseItem(state, payload, false);
        }
        case 'expandSelected': {
            return expandOrCollapseItem(state, payload, true);
        }

        //Mouse events
        case 'onExpandClick': {
           return expandOrCollapseItem(state, payload, null);
        }

        default:
    }

    return state;
}

//Internal helpers
function normaliseItemsForState(items, expanded = null, path = []) {
    const normalisedItems =  items.map((item, index) => {
        if(!item?.items?.length) {
            return [];
        } else {
            const newPath = [...path, index];

            if(expanded && item.expanded) {//can only be expanded if you have 
                expanded[getPathName(newPath)] = true
            }

            return normaliseItemsForState(item.items, expanded, newPath).items
        }
    })

    return {
        items: normalisedItems,
        expanded,
    }
}

function getItemByPath(path, items) {
    if(path.length === 0) {
        return null;
    }

    return path.reduce((items, index) => {
        return items[index];
    }, items)
}

export function getPathName(path) {
    return path.join('-');
}

//transform methods
function expandOrCollapseItem(state, path, expand) {
    const item = getItemByPath(path, state.items);

    //check this is an item that can expand/collapse
    if(item?.length > 0) {
        const pathName = getPathName(path);
        const newValue = expand === null ?
            !state.expanded[pathName]
            :
            !!expand

        if(newValue !== state.expanded[pathName]) {//only update state if value changes
            return {
                ...state,
                expanded: {
                    ...state.expanded,
                    [pathName]: newValue
                }
            }
        }
        
    }

    return state;
}