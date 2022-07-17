import { useCallback, useEffect, useRef } from "react";


//Call with handlers to be called hen focus enters/exits a component (including portals)
//returns props to be added to component to listen for events
export default function useIsFocusWithin(onFocusHandler = null, onBlurHandler = null) {
    const state = useRef();

    if(!state.current) {
        state.current = {
            isFocusWithin: null,
            hasFocusTriggered: false,
            hasBlurTriggered: false,
            onFocusHandler,
            onBlurHandler
        };
    } else {
        state.current.onFocusHandler = onFocusHandler;
        state.current.onBlurHandler = onBlurHandler;
    }

    //Callbacks
    const doOnFocus = useCallback(
        (e) => {
            state.current.isFocusWithin = true;

            onFocusHandler?.(e);
        },
        []
    );

    const doOnBlur = useCallback(
        (e) => {
            state.current.isFocusWithin = false;

            onBlurHandler?.(e);
        },
        []
    );

    const onDocumentFocusIn = useCallback(
        (e) => {
            const {hasFocusTriggered, isFocusWithin} = state.current;

            if(hasFocusTriggered) {
                state.current.hasFocusTriggered = false;//reset

                isFocusWithin !== true && doOnFocus(e);
            } else {
                isFocusWithin !== false && doOnBlur(e);
            }
        },
        []
    );

    const onFocus = useCallback(
        () => {
            state.current.hasFocusTriggered = true;
        },
        []
    );

    //Side effects
    useEffect(
        () => {
            document.addEventListener('focusin', onDocumentFocusIn);

            return () => {//tidy up method
                document.removeEventListener('focusin', onDocumentFocusIn);
            }
        },
        []
    );

    //Props to be added to the component to make this work
    return onFocus
}