import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

//Hooks
import usePathSelector from "hooks/usePathSelector";


//The factory
const initialState = {
    sortCol: null,
    sortDir: null,
    page: 0,
};

const reducers = {
    onSetSort(state, {payload: {sortCol, sortDir}}) {
        state.sortCol = sortCol;
        state.sortDir = sortDir;
    },
    onSetPage(state, {payload}) {
        state.page = payload;
    }
};

export default function makeDataTableReducer(name, modifyInitialState = null) {
    const slice = createSlice({
        name,
        initialState: modifyInitialState ? modifyInitialState(initialState) : initialState,
        reducers,
    })

    function useHook() {
        const dispatch = useDispatch();
        const state = usePathSelector(name, state => state);

        const onSetSort = useCallback(
            (sortCol, sortDir) => dispatch(slice.actions.setSelectedIndex({sortCol, sortDir})),
            []
        );

        const onSetPage = useCallback(
            (page) => dispatch(slice.actions.onSetPage(page)),
            []
        );

        return {
            state,
            onSetSort,
            onSetPage
        };
    }

    return {
        reducer: slice.reducer,
        useHook
    }
}


export function useDataTable(path) {
    const dispatch = useDispatch();
    const state = usePathSelector(path, state => state);

    const onSetSort = useCallback(
        (sortCol, sortDir) => dispatch({type: `${path}/onSetSort`, payload: {sortCol, sortDir}}),
        []
    );

    const onSetPage = useCallback(
        (page) => dispatch({type: `${path}/onSetPage`, payload: page}),
        []
    );

    return {
        state,
        onSetSort,
        onSetPage
    };
}

