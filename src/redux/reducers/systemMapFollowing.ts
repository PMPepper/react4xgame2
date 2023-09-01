import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import {set as setSelectedSystemId} from './selectedSystemId'


export const slice = createSlice({
    name: 'systemMapFollowing',
    initialState: null as null | number,
    reducers: {
        set: (state, {payload}: PayloadAction<number | null>) => {
            return payload;
        },
    },
    extraReducers: (builder) => {
        //If we change system, clear the value of systemMapFollowing
        builder.addCase(setSelectedSystemId, () => null)
    }
});

export const { set } = slice.actions
export default slice.reducer