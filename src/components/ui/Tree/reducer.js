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

        //Mouse events
        case 'onExpandClick': {
            const pathName = getPathName(payload);

            //TODO validate? is already handled on client? Ideally, yes

            return {
                ...state,
                expanded: {
                    ...state.expanded,
                    [pathName]: !state.expanded[pathName]
                }
            }
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

export function getPathName(path) {
    return path.join('-');
}