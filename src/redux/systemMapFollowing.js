import { createSlice } from '@reduxjs/toolkit'


export const slice = createSlice({
    name: 'systemMapFollowing',
    initialState: null,
    reducers: {
        set: (state, {payload}) => {
            return payload;
        },
    },
});

export const { set } = slice.actions
export default slice.reducer