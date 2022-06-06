import { useReducer, useEffect, useRef } from "react";

//Consts
import {DividerName} from './index';
const MOUSE_ENTER_MENU_OPEN_DELAY = 0.25;//seconds
const MOUSE_ENTER_MENU_CLOSE_DELAY = 0.5;//seconds


//The hook
export default function useMenu(items) {
    const ref = useRef();

    if(!ref.current) {
        ref.current = {
            firstTime: true,
            pendingActions: {}
        };
    }

    const [state, dispatch] = useReducer(reducer, initialState, (initialState) => ({
        ...initialState,
        items: normaliseItemsForState(items)
    }));

    useEffect(() => {
        //on first open, set dispatch in state
        dispatch({type: 'setDispatch', payload: dispatch});

        return () => {
            //tidy up
            //-stop any pending actions
            Object.keys(state.actions).forEach((id) => clearTimeout(id))
        }
    }, [])

    //keeps state updated with items
    useEffect(
        () => {
            if(ref.current.firstTime) {//skip the first time
                ref.current.firstTime = false;
            } else {
                dispatch({type: 'updateItems', payload: normaliseItemsForState(items)});
            }
        },
        [items]
    );

    return [state, dispatch]
}

//recursiverly convert items into simple nested array - dividers = null, items with no children = [], and items with children come an array of their children
function normaliseItemsForState(items) {
    return items.map(item => {
        if(item === DividerName) {
            return null
        } else if(!item?.items?.length) {
            return []
        } else {
            return normaliseItemsForState(item.items);
        }
    })
}


export const initialState = {
    items: null,
    itemsSelectedAtLevel: [],
    itemsOpenAtLevel: [],

    actions: {},//{[id]: {type: string, delay: number(seconds), id: string, data: optional additional info}}
};


function reducer(state, {type, payload}) {
    switch(type) {
        //General events
        case 'updateItems':
            return {
                ...state,
                items: payload
            }
        case 'setDispatch':
            return {
                ...state,
                dispatch: payload
            }
        case 'performAction': {
            const {id, type: actionType, data} = payload;
            
            if(!state.actions[id]) {
                return state;//action no longer valid, do nothing
            }

            const newState = removeAction(state, id);

            switch(actionType) {
                case 'delayedOpenMenu': {
                    return cancelActionTypes(
                        setItemsOpenAtLevel(newState, data.level, data.index),
                        [
                            'delayedOpenMenu',
                            'delayedCloseMenu'
                        ]
                    );
                }
                case 'delayedCloseMenu': {
                    const {level} = data;

                    return setItemsOpenAtLevel(newState, level, null);
                }
            }

            return state;
        }
        //Mouse events
        case 'mouseEnter':{
            const newState = setItemsSelectedAtLevel(state, payload.level, payload.index);

            const item = getSelectedItem(newState);

            if(item?.length > 0) {
                // if selected item has children, set timer to open it's submenu (this will close other open menus)
                return addAction(cancelActionTypes(newState, ['delayedCloseMenu']), {delay: MOUSE_ENTER_MENU_OPEN_DELAY, type: 'delayedOpenMenu', data: payload});
            } else {
                //if a different, lower level menu is open, set an action to delayed close it
                const {itemsOpenAtLevel} = newState;

                if(itemsOpenAtLevel.length > payload.level) {
                    return addAction(newState, {delay: MOUSE_ENTER_MENU_CLOSE_DELAY, type: 'delayedCloseMenu', data: {level: payload.level}})
                }
            }

            return newState;
        }
        case 'mouseLeave': {
            //cancel any delayed open menu actions
            return cancelActionTypes(state, ['delayedOpenMenu'])
        }
        case 'mouseLeaveMenu': {
            //deselect the deepest open level
            const {itemsOpenAtLevel} = state;
            
            return setItemsSelectedAtLevel(state, itemsOpenAtLevel.length, null)
        }
        case 'openMenu': {
            return cancelActionTypes(
                setItemsOpenAtLevel(state, payload.level, payload.index),
                [
                    'delayedOpenMenu',
                    'delayedCloseMenu'
                ]
            );
        }

        //keyboard events
        case 'keyboardDown':{
            const {itemsSelectedAtLevel} = state;
            const items = getItemsAtSelectedLevel(state) || state.items;
            const level = itemsSelectedAtLevel.length ? itemsSelectedAtLevel.length -1 : 0;
            const index = getNextSelectableItemIndex(items, itemsSelectedAtLevel[level] ?? -1)

            return setItemsSelectedAtLevel(state, level, index);
        }
        case 'keyboardUp':{
            const {itemsSelectedAtLevel} = state;
            const items = getItemsAtSelectedLevel(state) || state.items;
            const level = itemsSelectedAtLevel.length ? itemsSelectedAtLevel.length -1 : 0;
            const index = getPrevSelectableItemIndex(items, itemsSelectedAtLevel[level] ?? items.length)

            return setItemsSelectedAtLevel(state, level, index);
        }
        case 'keyboardLeft':{
            const {itemsSelectedAtLevel, itemsOpenAtLevel} = state;

            if(itemsSelectedAtLevel.length > 1) {//there is a level to go up
                //close current topmost menu
                //select parent item to the topmost menu
                const level = itemsSelectedAtLevel.length - 2;
                
                return setItemsSelectedAtLevel(
                    setItemsOpenAtLevel(state, level, null),
                    level,
                    itemsOpenAtLevel[level]
                );
            }

            return state;
        }
        case 'keyboardRight':{
            const {itemsSelectedAtLevel, items} = state;

            if(itemsSelectedAtLevel.length === 0) {//no items selected, select first item at root level
                return setItemsSelectedAtLevel(state, 0, getNextSelectableItemIndex(items, -1));
            }

            const item = getSelectedItem(state);

            if(item?.length) {
                const level = itemsSelectedAtLevel.length - 1;

                return setItemsSelectedAtLevel(
                    setItemsOpenAtLevel(state, level, itemsSelectedAtLevel[level]),
                    level + 1,
                    getNextSelectableItemIndex(item, -1)//find the first selectable child
                );
            }
            
            return state;
        }
        //unknown type
        default:
            console.log('Unknown type: ', type)
            return state;
    }
}

function getSelectedItem({items, itemsSelectedAtLevel}) {
    if(itemsSelectedAtLevel.length === 0) {
        return null;//nothing is selected
    }

    for(let i = 0; i < itemsSelectedAtLevel.length; i++) {
        items = items[itemsSelectedAtLevel[i]];
    }

    return items;
}

function getNextSelectableItemIndex(items, startIndex) {
    const nextIndex = items.findIndex((item, index) => {
        return !!item && index > startIndex
    })

    return nextIndex === -1 ?
        items.findIndex((item) => {
            return !!item
        })
        :
        nextIndex;
}

function getPrevSelectableItemIndex(items, startIndex) {
    const prevIndex = items.findLastIndex((item, index) => {
        return !!item && index < startIndex
    })

    return prevIndex === -1 ?
        items.findLastIndex((item) => {
            return !!item
        })
        :
        prevIndex;
}

function getItemsAtSelectedLevel({items, itemsSelectedAtLevel}) {
    if(itemsSelectedAtLevel.length === 0) {
        return null;//nothing is selected
    }

    for(let i = 0; i < itemsSelectedAtLevel.length -1; i++) {
        items = items[itemsSelectedAtLevel[i]];
    }

    return items;
}

//State transforms
function addAction(state, actions) {//add action or array of actions

    const newActions = (actions instanceof Array) ?
        actions.map((action) => initAction(action, state.dispatch))
        :
        [initAction(actions, state.dispatch)]

    if(actions.length === 0) {
        return state;
    }

    return {
        ...state,
        actions: newActions.reduce((output, action) => {
            output[action.id] = action

            return output;
        }, {...state.actions})
    }
}

function initAction(action, dispatch) {
    const initedAction = {
        ...action, 
        id: setTimeout(() => dispatch({type: 'performAction', payload: initedAction}), action.delay * 1000)
    };

    return initedAction;
}

function removeAction(state, id) {
    const newActions = {...state.actions};
    clearTimeout(id);//just in case
    delete newActions[id];

    return {
        ...state,
        actions: newActions
    }
}

function cancelActionTypes(state, actionTypes) {
    const {actions} = state;

    return {
        ...state,
        actions: Object.keys(actions).reduce((output, id) => {
            const action = actions[id];

            if(!actionTypes.includes(action.type)) {
                output[id] = action;
            } else {
                clearTimeout(id);
            }

            return output;
        }, {})
    }
}

function setItemsSelectedAtLevel(state, level, index) {
    const {itemsSelectedAtLevel} = state;

    return {
        ...state,
        itemsSelectedAtLevel: index === null ?
            itemsSelectedAtLevel.slice(0, level)
            :
            [...itemsSelectedAtLevel.slice(0, level), index]
    }
}

function setItemsOpenAtLevel(state, level, index) {
    const {itemsOpenAtLevel} = state;

    return {
        ...state,
        itemsOpenAtLevel: index === null ?
        itemsOpenAtLevel.slice(0, level)
            :
            [...itemsOpenAtLevel.slice(0, level), index]
    }
}
