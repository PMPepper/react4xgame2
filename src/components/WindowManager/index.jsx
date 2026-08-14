//TODO tab order for windows? currently is weird?
import {useMemo, useRef, useCallback, cloneElement} from 'react';

//Components
import Window from "./Window";

//Classes
import Rectangle from 'classes/Rectangle';

//Hooks
import useForceUpdate from 'hooks/useForceUpdate';
import useRefCallback from 'hooks/useRefCallback';

//Helpers
import mapToSortedArray from 'helpers/object/map-to-sorted-array';
import sortOnPropNumeric from 'helpers/sorting/sort-on-prop-numeric';
import childrenToArray from 'helpers/react/children-to-array';
import clamp from 'helpers/math/clamp';

//Other
import defaultStyles from './WindowManager.module.scss';

//Consts
const BLANK = {};

//given the defined area of the window manager, and the size of the window, return
//a rectangle object that defines teh bounds that the windows x/y may occupy
const defaultGetBounds = (area, windowBoundsRect) => {
    const {x = 0, y = 0, width, height} = area;

    return Rectangle.fromEdges(
        y - 10,//top
        x - windowBoundsRect.width + 10,//left
        y + height - 10,//bottom
        x + width - 10//right
    );
}
const sortOnInteractionTime = sortOnPropNumeric('interactionTime');


export default function WindowManager({children, area, getBounds = defaultGetBounds, styles = defaultStyles}) {
    const stateRef = useRef({
        windowState: {},//{[key]: {state object}}
        windows: [],//list of keys in source order
        getBounds,
        area,
    });

    stateRef.current.getBounds = getBounds;
    stateRef.current.area = area;

    const forceUpdate = useForceUpdate();

    //Callbacks
    const onWindowInteract = useCallback(
        (key) => {
            const {windowState} = stateRef.current;

            windowState[key].interactionTime = Date.now();
            sortElements(stateRef.current, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

            forceUpdate();
        },
        [forceUpdate]
    );

    const onWindowClose = useCallback(
        (key) => {
            const {windowState} = stateRef.current;
            
            //update windows state
            windowState[key].open = false;

            forceUpdate();
        },
        [forceUpdate]
    );

    const onWindowResize = useRefCallback(
        (key, top, right, bottom, left) => {
            if(top === null && right === null && bottom === null && left === null) {
                return;//nothing has changed
            }

            if(top !== null && bottom !== null) {
                throw new Error('supply top OR bottom, not both at once');
            }

            if(left !== null && right !== null) {
                throw new Error('supply left OR right, not both at once');
            }

            const {windowState} = stateRef.current;

            //Enforce size limits
            const state = windowState[key];
            const props = state.original.props;

            const minWidth = props.minWidth ?? null;
            const maxWidth = props.maxWidth ?? null;
            const minHeight = props.minHeight ?? null;
            const maxHeight = props.maxHeight ?? null;

            if(left) {
                if(left < state.position.left && maxWidth !== null) {
                    const newWidth = state.position.right - left;
                    
                    if(newWidth > maxWidth) {
                        left = state.position.right - maxWidth;
                    }
                } else if(left > state.position.left && minWidth !== null) {
                    const newWidth = state.position.right - left;

                    if(newWidth < minWidth) {
                        left = state.position.right - minWidth;
                    }
                }
            } else if(right) {
                if(right < state.position.right && minWidth !== null) {
                    const newWidth = right - state.position.left;

                    if(newWidth < minWidth) {
                        right = state.position.left + minWidth;
                    }
                } else if(right > state.position.right && maxWidth !== null) {
                    const newWidth = right - state.position.left;

                    if(newWidth > maxWidth) {
                        right = state.position.left + maxWidth;
                    }
                }
            }

            if(top) {
                if(top < state.position.top && maxHeight !== null) {
                    const newHeight = state.position.bottom - top;
                    
                    if(newHeight > maxHeight) {
                        top = state.position.bottom - maxHeight;
                    }
                } else if(top > state.position.top && minHeight !== null) {
                    const newHeight = state.position.bottom - top;

                    if(newHeight < minHeight) {
                        top = state.position.bottom - minHeight;
                    }
                }
            } else if(bottom) {
                if(bottom < state.position.bottom && minHeight !== null) {
                    const newHeight = bottom - state.position.top;

                    if(newHeight < minHeight) {
                        bottom = state.position.top + minHeight;
                    }
                } else if(bottom > state.position.bottom && maxHeight !== null) {
                    const newHeight = bottom - state.position.top;

                    if(newHeight > maxHeight) {
                        bottom = state.position.top + maxHeight;
                    }
                }
            }
            //End enforce size limits

            top !== null && (state.position.top = top);
            right !== null && (state.position.right = right);
            bottom !== null && (state.position.bottom = bottom);
            left !== null && (state.position.left = left);

            state.element = makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

            forceUpdate();
        }
    );

    const onWindowDrag = useRefCallback(
        (key, x, y) => {
            const {getBounds, area, windowState} = stateRef.current;
            const state = windowState[key];

            if(positionWindow(x, y, state, area, getBounds)) {
                state.element = makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

                forceUpdate();
            }
        }
    );

    const nonWindowContent = useMemo(
        () => {
            const {windowState: currentWindowState, windows, area} = stateRef.current;
            const nonWindowContent = [];
            windows.length = 0;

            const windowsState = childrenToArray(children, true).reduce((output, child) => {
                if(!isWindow(child)) {
                    nonWindowContent.push(child);

                    return output;
                }
                
                const key = child.key;
                windows.push(key);

                output[key] = currentWindowState[key] ?
                    {
                        ...currentWindowState[key],
                        original: child
                    }
                    :
                    {
                        original: child,
                        position: new Rectangle(
                            child.props.x || 0,
                            child.props.y || 0,
                            child.props.width || 100,
                            child.props.height || 100,
                        ),
                        interactionTime: Date.now(),
                        open: true,
                        order: null,
                    };
                
                // enforce bounds
                positionWindow(output[key].position.x, output[key].position.y, output[key], area, getBounds);

                //do not make new element, as we need to do that after sorting below

                return output;
            }, {});

            //store values in stateRef
            stateRef.current.windowState = windowsState;
            sortElements(stateRef.current, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

            return nonWindowContent;
        },
        [children, getBounds, onWindowClose, onWindowDrag, onWindowInteract, onWindowResize]
    );

    useMemo(
        () => {//continue to enforce bounds as area changes, or getBounds rules change
            const {windowState} = stateRef.current;

            Object.keys(windowState).forEach(key => {
                const state = windowState[key];

                if(positionWindow(state.position.x, state.position.y, state, area, getBounds)) {
                    state.element = makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);
                }
            })
        },
        [area, getBounds, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize]
    )

    //Render
    return <>
        <div className={styles.root}>
            {stateRef.current.windows.map((key) => stateRef.current.windowState[key].element)}
        </div>
        {nonWindowContent}
    </>
}


WindowManager.Window = Window;


//Internal helper methods
function isWindow(elem) {
    return elem.type === WindowManager.Window;
}

//returns bool true if window position was changed
function positionWindow(nx, ny, windowState, area, getBounds) {
    const ox = windowState.position.x;
    const oy = windowState.position.y;

    // //enforce bounds
    if(getBounds) {
        const windowPositionBoundsRect = getBounds(area, windowState.position);

        //is window within this
        windowState.position.x = clamp(nx, windowPositionBoundsRect.x, windowPositionBoundsRect.right);
        windowState.position.y = clamp(ny, windowPositionBoundsRect.y, windowPositionBoundsRect.bottom);
    } else {
        windowState.position.x = nx;
        windowState.position.y = ny;
    }

    return ox !== windowState.position.x || oy !== windowState.position.y;
}

function makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize) {
    const {original, position, order} = state;
    const key = original.key;
    const {noClose, noDrag, noResize} = original.props;

    return cloneElement(
        original, 
        {
            x: position.x, y: position.y, width: position.width, height: position.height,
            order,
            onInteract: () => onWindowInteract(key),
            onRequestClose: noClose ? null : () => onWindowClose(key),
            onDrag: noDrag ? null : (dx, dy) => onWindowDrag(key, dx, dy),
            onResize: noResize ? null : (top, right, left, bottom) => onWindowResize(key, top, right, left, bottom),
        }
    );
}

function sortElements(current, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize) {//TODO
    const {windowState} = current;

    const windowsInOrder = mapToSortedArray(
        windowState,
        (state, key) => key,
        sortOnInteractionTime,
    );

    windowsInOrder.forEach((key, index) => {
        windowState[key].order = index;
        windowState[key].element = makeElement(windowState[key], onWindowInteract, onWindowClose, onWindowDrag, onWindowResize)
    })
}