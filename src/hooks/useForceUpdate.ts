import {useState, useCallback, useRef} from 'react';


//The hook
export default function useForceUpdate() {
    const ref = useRef(0);
    const [, setValue] = useState(0); // integer state
    
    return useCallback(
        () => setValue(++ref.current), // update the state to force render
        []
    );
}