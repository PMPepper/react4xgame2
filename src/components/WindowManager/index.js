import {useMemo, useRef, useCallback, cloneElement, memo} from 'react';

//Components
import Window from "./Window";

//Classes
import Rectangle from 'classes/Rectangle';

//Hooks
import useForceUpdate from 'hooks/useForceUpdate';

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


//The component
//TODO enforce bounds on area change
const WindowManager = memo(function WindowManager({children, area, getBounds = defaultGetBounds, styles = defaultStyles}) {
    const ref = useRef({
        windowState: BLANK,
        windows: null,
        windowKeyToIndex: {},
        getBounds,
        area
    });

    ref.current.getBounds = getBounds;
    ref.current.area = area;

    const forceUpdate = useForceUpdate();

    //Callbacks
    const onWindowInteract = useCallback(
        (key) => {
            const {windowState} = ref.current;

            windowState[key].interactionTime = Date.now();
            sortElements(ref.current);

            
            forceUpdate();
        },
        []
    );

    const onWindowDrag = useCallback(
        (key, x, y) => {
            const {getBounds, area, windowState, windows, windowKeyToIndex} = ref.current;
            const state = windowState[key];

            state.position.x = x;
            state.position.y = y;

            //enforce bounds
            if(getBounds) {
                const windowPositionBoundsRect = getBounds(area, state.position);

                //is window within this
                state.position.x = clamp(x, windowPositionBoundsRect.x, windowPositionBoundsRect.right);
                state.position.y = clamp(y, windowPositionBoundsRect.y, windowPositionBoundsRect.bottom);
            }

            state.element = makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

            //update windows array
            windows[windowKeyToIndex[key]] = state.element;

            forceUpdate();
        },
        []
    );

    const onWindowClose = useCallback(
        (key) => {
            const {windowState, windows, windowKeyToIndex} = ref.current;
            
            windowState[key].open = false;

            //update windows array
            windows[windowKeyToIndex[key]] = null;

            forceUpdate();
        },
        []
    );

    const onWindowResize = useCallback(
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

            const {windowState, windows, windowKeyToIndex} = ref.current;

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

            //update windows array
            windows[windowKeyToIndex[key]] = state.element;

            forceUpdate();
        },
        []
    );

    //Memoised values
    //-If windows change, initialise them
    const nonWindowContent = useMemo(
        () => {
            const {windowState: currentWindowState} = ref.current;
            const nonWindowContent = [];

            const windowsState = childrenToArray(children, true).reduce((output, child) => {
                if(!isWindow(child)) {
                    nonWindowContent.push(child);

                    return output;
                }
                
                const key = child.key;

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
                    };

                output[key].element = makeElement(output[key], onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

                return output;
            }, {});

            //store values in ref
            ref.current.windowState = windowsState;
            sortElements(ref.current);

            return nonWindowContent;
        },
        [children]
    );

    //Render
    return <>
        <div className={styles.root}>
            {ref.current.windows}
        </div>
        {nonWindowContent}
    </>
});

export default WindowManager;

WindowManager.Window = Window;


//Internal helper methods
function isWindow(elem) {
    return elem.type === WindowManager.Window;
}

function makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize) {
    const {original, position} = state;
    const key = original.key;
    const {noClose, noDrag, noResize} = original.props;

    return cloneElement(
        original, 
        {
            x: position.x, y: position.y, width: position.width, height: position.height,
            onInteract: () => onWindowInteract(key),
            onRequestClose: noClose ? null : () => onWindowClose(key),
            onDrag: noDrag ? null : (dx, dy) => onWindowDrag(key, dx, dy),
            onResize: noResize ? null : (top, right, left, bottom) => onWindowResize(key, top, right, left, bottom),
        }
    );
}

function sortElements(current) {
    const {windowState} = current;

    const windows = mapToSortedArray(
        windowState,
        ({element}) => element,
        sortOnInteractionTime,
    );

    //generate key to sorted index lookup
    current.windowKeyToIndex = windows.reduce((output, {key}, index) => {
        output[key] = index;

        return output
    }, {})

    current.windows = windows.map(window => {
        return windowState[window.key].open ?
            window
            :
            null;
    });
}