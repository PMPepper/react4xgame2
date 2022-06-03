import {useState, useEffect, useRef} from 'react';
import {shallowEqual} from 'react-redux';

//Hooks
import useStateDebounce from 'hooks/useStateDebounce';
import useRefCallback from 'hooks/useRefCallback';


//The hook (using observers, the modern way)
export default function useElementSize(currentRef = null, wait = 0, {width = true, height = true, x = false, y = false, getElement = x => x} = {}, debounceOptions = null) {
    const [dimensions, setDimensionsDebounce, setDimensionsImmediate] = useStateDebounce(null, wait, debounceOptions);
    const setDimensions = wait ? setDimensionsDebounce : setDimensionsImmediate;

    const [, setElem] = useState(null);

    //keep track of props in ref so we can avoid creating new functions constantly
    const ref = useRef({
        dimensions,
        setDimensions,
        elem: null,
        setElem: null,
        observer: null
    });

    //Ensure that ref is up to date
    ref.current.dimensions = dimensions;
    ref.current.setDimensions = setDimensions;

    //initialise the observer
    if(ref.current.observer === null) {
        ref.current.observer = new ResizeObserver((entries, observer) => {
            if(entries[0]) {
                //get watched properties in normalised form
                const rect = getDimensionObject(entries[0].target, width, height, x, y);

                //if dimensions have changed, update
               !shallowEqual(rect, ref.current.dimensions) && ref.current.setDimensions(rect)
            }
        });
    }

    //Monitor the ref, and set the observer as required
    const setElemCallback = useRefCallback(
        (rawElement) => {
            const elem = getElement(rawElement);

            if(elem !== ref.current.elem) {
                const {observer, elem: curElem} = ref.current;
    
                if(curElem) {
                    observer.unobserve(curElem)
                }
    
                if(elem) {
                    observer.observe(elem);
                }
    
                //record the elem
                ref.current.elem = elem;
                setElem(elem);//this will trigger update
            }

            if(currentRef) {
                (currentRef instanceof Function) ?
                    currentRef(elem)
                    :
                    currentRef.current = elem;
            }
        }
    );

    //on unmount, stop listening to events & tidy up
    useEffect(() => {
      return () => {
            /* eslint-disable react-hooks/exhaustive-deps */
            ref.current.observer?.disconnect();
            ref.current.observer = null;
            ref.current.elem = null;
        }
    }, []);

    return [setElemCallback, dimensions, ref.current.elem];
}


//{width: rect.width, height: rect.height, top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right, x: rect.left, y: rect.top}
function getDimensionObject(elem, width, height, x, y) {
    const rect = elem.getBoundingClientRect();
    const normalisedOutput = {};

    if(width) {
        normalisedOutput.width = rect.width;
    }

    if(height) {
        normalisedOutput.height = rect.height;
    }

    if(x) {
        normalisedOutput.x = normalisedOutput.left = "x" in rect ? rect.x : rect.left;
        normalisedOutput.right = rect.right;
    }

    if(y) {
        normalisedOutput.y = normalisedOutput.top = "y" in rect ? rect.y : rect.top;
        normalisedOutput.bottom = rect.bottom;
    }

    return normalisedOutput;
}