import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type State = number | null;

export const slice = createSlice({
    name: 'selectedSystemId',
    initialState: null as State,
    reducers: {
        set: (state: State, {payload}: PayloadAction<State>) => {
            return payload;
        },
    },
});

export const { set } = slice.actions
export default slice.reducer