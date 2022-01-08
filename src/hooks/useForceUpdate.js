import {useState, useCallback} from 'react';

export default function useForceUpdate() {
    const [, setValue] = useState(0); // integer state
    
    return useCallback(
        () => setValue(value => value + 1), // update the state to force render
        []
    );
}