import {useMemo, useRef, useCallback, Children, cloneElement} from 'react';

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
    const onWindowDrag = useCallback(
        (key, dx, dy) => {
            const state = windowStateRef.current[key];

            state.position.translateBy(dx, dy);

            //TODO enforce bounds

            state.element = makeElement(state, onWindowClose, onWindowDrag, onWindowResize);

            //rebuild windows array
            windowsRef.current[windowKeyToIndexRef.current[key]] = state.element;

            forceUpdate();
        },
        []
    );

    const onWindowClose = useCallback(
        (key) => {


            forceUpdate();
        },
        []
    );

    const onWindowResize = useCallback(
        () => {
            //TODO
        },
        []
    );

    //Memoised values
    //-If windows change, initialise them
    windowStateRef.current = useMemo(
        () => {
            const currentWindowState = windowStateRef.current;

            return Children.toArray(children).reduce((output, child) => {
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

                output[key].element = makeElement(output[key], onWindowClose, onWindowDrag, onWindowResize);

                return output;
            }, {});
        },
        [children]
    );

    windowsRef.current = useMemo(
        () => {
            return sortElements(windowStateRef.current, windowKeyToIndexRef);
        },
        [windowStateRef.current]
    );


    //Render
    return <div className={styles.root} ref={ref}>
        {windowsRef.current}
    </div>
}

WindowManager.Window = Window;


//Internal helper methods
function makeElement(state, onWindowClose, onWindowDrag, onWindowResize) {
    const {original, position} = state;
    const key = original.key;
    const {noClose, noDrag, noResize} = original.props;

    return cloneElement(
        original, 
        {
            x: position.x, y: position.y, width: position.width, height: position.height,
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
        sortOnInteractionTime
    );

    //generate key to sorted index lookup
    windowKeyToIndexRef.current = windows.reduce((output, {key}, index) => {
        output[key] = index;

        return output
    }, {})

    return windows;
}