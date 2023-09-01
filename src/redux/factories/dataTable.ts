import {useMemo} from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

//Hooks
import usePathSelector from "hooks/usePathSelector";

type SortDir = 'asc' | 'desc' | undefined;

type DataTableStateType<TColumns extends string> = {
    sortCol: TColumns | undefined,
    sortDir: SortDir,
    page: number,
}

//The factory
const initialState: DataTableStateType<string> = {
    sortCol: undefined,
    sortDir: undefined,
    page: 0,
};

export default function makeDataTableReducer<TColumns extends string = string>(name: string, modifyInitialState?: (initialState: DataTableStateType<string>) => DataTableStateType<TColumns>) {
    const slice = createSlice({
        name,
        initialState: (modifyInitialState ? modifyInitialState(initialState) : (initialState as DataTableStateType<TColumns>)) as DataTableStateType<TColumns>,
        reducers: {
            //TODO sortDir can only be undefined if sortCol is undefined too
            onSetSort(state, {payload: {sortCol, sortDir}}: PayloadAction<{sortCol: TColumns | undefined, sortDir: SortDir}>) {
                state.sortCol = sortCol as any;//no idea why this is required
                state.sortDir = sortDir;
            },
            onSetPage(state, {payload}: PayloadAction<number>) {
                state.page = payload;
            }
        },
    })

    function useHook() {
        const dispatch = useDispatch();
        const state = usePathSelector(name, state => state);

        const onSetSort = useCallback(
            (sortCol: TColumns | undefined, sortDir: SortDir) => dispatch(slice.actions.onSetSort({sortCol, sortDir})),
            []
        );

        const onSetPage = useCallback(
            (page: number) => dispatch(slice.actions.onSetPage(page)),
            []
        );

        return useMemo(() => ({
            state,
            onSetSort,
            onSetPage
        }), [state, onSetSort, onSetPage]);
    }

    return {
        reducer: slice.reducer,
        useHook
    }
}


export function useDataTable<TColumns extends string = string>(path: string | string[]) {
    const dispatch = useDispatch();
    const state = usePathSelector<DataTableStateType<TColumns>>(path, state => state);

    const onSetSort = useCallback(
        (sortCol: TColumns | undefined, sortDir: SortDir) => dispatch({type: `${path}/onSetSort`, payload: {sortCol, sortDir}}),
        []
    );

    const onSetPage = useCallback(
        (page: number) => dispatch({type: `${path}/onSetPage`, payload: page}),
        []
    );

    return useMemo(() => ({
        state,
        onSetSort,
        onSetPage
    }), [state, onSetSort, onSetPage]);
}

