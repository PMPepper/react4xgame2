//TODO incomplete
import { useCallback, useEffect, useRef } from "react";
import mergeRefs from "react-merge-refs";


//The hook
export default function useOnClickOutside(callback, currentRef = null) {
    const ref = useRef();
    const callbackRef = useRef();
    callbackRef.current = callback;

    const onClickOutside = useCallback(
        (e) => {
            const {target} = e;
            const elem = ref.current;

            if(target !== elem && !elem.contains(target)) {
                callbackRef.current?.();
            }
        },
        []
    );

    const onTidyUp = useCallback(
        () => {
            window.removeEventListener('mousedown', onClickOutside);
        },
        []
    )

    //Side effects
    useEffect(
        () => {
            window.addEventListener('mousedown', onClickOutside);

            return onTidyUp;
        },
        []
    );

    return mergeRefs([ref, currentRef]);
}