import {useCallback, useRef} from 'react';


export default function useRefCallback(callback) {
    const callbackRef = useRef();
    callbackRef.current = callback;//ref always points to most recent version of callback

    return useCallback(
        (...args) => callbackRef.current(...args),
        []
    )
}