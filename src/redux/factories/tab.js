import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

//Hooks
import usePathSelector from "hooks/usePathSelector";


//The factory
const initialState = 0;

const reducers = {
    setSelectedIndex(state, {payload}) {
        return payload
    }
};

export default function makeTabReducer(name, modifyInitialState = null) {
    const slice = createSlice({
        name,
        initialState: modifyInitialState ? modifyInitialState(initialState) : initialState,
        reducers,
    })

    function useHook() {
        const dispatch = useDispatch();
        const selectedIndex = usePathSelector(name, state => state);

        const setSelectedIndex = useCallback(
            (selectedIndex) => dispatch(slice.actions.setSelectedIndex(selectedIndex)),
            []
        );

        return {
            state: selectedIndex,
            setSelectedIndex
        };
    }

    return {
        reducer: slice.reducer,
        useHook
    }
}


export function useTab(path) {
    const dispatch = useDispatch();
    const selectedIndex = usePathSelector(path, state => state);

    const setSelectedIndex = useCallback(
        (selectedIndex) => dispatch({type: `${path}/setSelectedIndex`, payload: selectedIndex}),
        [path]
    );

    return {
        state: selectedIndex,
        setSelectedIndex
    };
}


    

    