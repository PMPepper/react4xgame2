import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

//Hooks
import usePathSelector from "hooks/usePathSelector";


//The factory
type TabStateType = number;
const initialState: TabStateType = 0;

const reducers = {
    setSelectedIndex(state, {payload}: PayloadAction<number>) {
        return payload
    }
};

export default function makeTabReducer(name: string, modifyInitialState?: (initialState: TabStateType) => TabStateType) {
    const slice = createSlice({
        name,
        initialState: modifyInitialState ? modifyInitialState(initialState) : initialState,
        reducers,
    })

    function useHook() {
        const dispatch = useDispatch();
        const selectedIndex = usePathSelector<TabStateType>(name, state => state);

        const setSelectedIndex = useCallback(
            (selectedIndex: TabStateType) => dispatch(slice.actions.setSelectedIndex(selectedIndex)),
            []
        );

        return useMemo(() => ({
            state: selectedIndex,
            setSelectedIndex
        }), [selectedIndex, setSelectedIndex]);
    }

    return {
        reducer: slice.reducer,
        useHook
    }
}

//TODO not 100% sure this whole 'path' concept works? is path = name?
export function useTab(path: string | string[]) {
    const dispatch = useDispatch();
    const selectedIndex = usePathSelector<TabStateType>(path, state => state);

    const setSelectedIndex = useCallback(
        (selectedIndex: TabStateType) => dispatch({type: `${path instanceof Array ? path.join('/') : path}/setSelectedIndex`, payload: selectedIndex}),
        [path]
    );

    return useMemo(() => ({
        state: selectedIndex,
        setSelectedIndex
    }), [selectedIndex, setSelectedIndex]);
}


    

    