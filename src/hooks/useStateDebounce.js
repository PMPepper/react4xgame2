import {useState, useMemo} from 'react';
import debounce from 'lodash/debounce';


export default function useDebounce(initialState, wait = 0, options = null) {
    const [state, setStateImmediate] = useState(initialState);

    const setStateDebounced = useMemo(
        () => debounce(setStateImmediate, wait, options),
        [wait, options]
    )

    return [state, setStateDebounced, setStateImmediate]
}