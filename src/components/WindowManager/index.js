import {useMemo, useRef, useCallback, cloneElement} from 'react';

//Components
import Window from "./Window";

//Classes
import Rectangle from 'classes/Rectangle';

//Hooks
import useElementSize from "hooks/useElementSize"
import useForceUpdate from 'hooks/useForceUpdate';

//Helpers
import mapToSortedArray from 'helpers/object/map-to-sorted-array';
import sortOnPropNumeric from 'helpers/sorting/sort-on-prop-numeric';
import childrenToArray from 'helpers/react/children-to-array';

//Other
import defaultStyles from './WindowManager.module.scss';

//Consts
const BLANK = {};
const sortOnInteractionTime = sortOnPropNumeric('interactionTime');


//The component
export default function WindowManager({children, styles = defaultStyles}) {
    const [ref, {width, height}] = useElementSize();
    const windowStateRef = useRef(BLANK);
    const windowsRef = useRef();
    const windowKeyToIndexRef = useRef();

    const forceUpdate = useForceUpdate();

    //Callbacks
    const onWindowInteract = useCallback(
        (key) => {
            windowStateRef.current[key].interactionTime = Date.now();
            windowsRef.current = sortElements(windowStateRef.current, windowKeyToIndexRef);
            forceUpdate();
        },
        []
    );

    const onWindowDrag = useCallback(
        (key, x, y, initialX, initialY) => {
            const state = windowStateRef.current[key];

            state.position.x = x;
            state.position.y = y;

            //TODO enforce bounds

            state.element = makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

            //update windows array
            windowsRef.current[windowKeyToIndexRef.current[key]] = state.element;

            forceUpdate();
        },
        []
    );

    const onWindowClose = useCallback(
        (key) => {
            const state = windowStateRef.current[key];

            state.open = false;

            //update windows array
            windowsRef.current[windowKeyToIndexRef.current[key]] = null;

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

            const state = windowStateRef.current[key];
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

            //TODO
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


            //TODO height

            top !== null && (state.position.top = top);
            right !== null && (state.position.right = right);
            bottom !== null && (state.position.bottom = bottom);
            left !== null && (state.position.left = left);

            //TODO enforce size limits

            state.element = makeElement(state, onWindowInteract, onWindowClose, onWindowDrag, onWindowResize);

            //update windows array
            windowsRef.current[windowKeyToIndexRef.current[key]] = state.element;

            forceUpdate();
        },
        []
    );

    //Memoised values
    //-If windows change, initialise them
    const nonWindowContent = useMemo(
        () => {
            const currentWindowState = windowStateRef.current;
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
            windowStateRef.current = windowsState;
            windowsRef.current = sortElements(windowsState, windowKeyToIndexRef);

            return nonWindowContent;
        },
        [children]
    );

    //Render
    return <>
        <div className={styles.root} ref={ref}>
            {windowsRef.current}
        </div>
        {nonWindowContent}
    </>
}

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

function sortElements(windowState, windowKeyToIndexRef) {
    const windows = mapToSortedArray(
        windowState,
        ({element}) => element,
        sortOnInteractionTime,
    );

    //generate key to sorted index lookup
    windowKeyToIndexRef.current = windows.reduce((output, {key}, index) => {
        output[key] = index;

        return output
    }, {})

    return windows.map(window => {
        return windowState[window.key].open ?
            window
            :
            null;
    });
}