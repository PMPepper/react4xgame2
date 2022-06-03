//TODO respect x/y/width/height options 

import {useCallback, useEffect, useState, useRef} from 'react';
import mergeRefs from 'react-merge-refs';

//classes
import Rectangle from 'classes/Rectangle';

//Hooks
import useStateDebounce from 'hooks/useStateDebounce';


//The hook
export default function useElementPosition(currentRef = null, wait = 0, {width = true, height = true, x = false, y = false, getElement = x => x} = {}, debounceOptions = null) {
    const elemRef = useRef();
    const isMonitoringRef = useRef(false);
    const [, _setElem] = useState();
    const [position, setPosition] = useStateDebounce(null, wait, debounceOptions);

    const measureAndRecordPosition = useCallback(
        () => {
            //measure element position and see if it has changed
            const elemPosition = getElement(elemRef.current)?.getBoundingClientRect();

            setPosition((curPosition) => {
                if(!elemPosition) {
                    return elemPosition;
                }

                if(curPosition && curPosition.x === elemPosition.x && curPosition.y === elemPosition.y && curPosition.width === elemPosition.width && curPosition.height === elemPosition.height) {
                    return curPosition;
                }

                return Rectangle.fromObj(elemPosition);
            });
        },
        []
    );

    const monitorElementSize = useCallback(() => {
        if(!elemRef.current) {
            isMonitoringRef.current = false;
            return;
        }

        isMonitoringRef.current = true;

        measureAndRecordPosition();

        //continue to monitor
        window.requestAnimationFrame(monitorElementSize);
    }, [])

    const setElem = useCallback(
        (newElem) => {
            elemRef.current = newElem;

            if(!isMonitoringRef.current) {
                monitorElementSize();
            }

            _setElem(newElem);
        },
        [_setElem]
    );

    useEffect(
        () => {
            //tidy up
            return () => {
                elemRef.current = null;//setting to null will force update loop to end
            }
        },
        []
    );

    return [mergeRefs([setElem, currentRef]), position, elemRef.current]
}