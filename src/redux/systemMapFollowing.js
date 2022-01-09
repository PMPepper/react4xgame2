import { createSlice } from '@reduxjs/toolkit'
import {set as setSelectedSystemId} from './selectedSystemId'


export const slice = createSlice({
    name: 'systemMapFollowing',
    initialState: null,
    reducers: {
        set: (state, {payload}) => {
            return payload;
        },
        //If we change system, clear the value of systemMapFollowing
        [setSelectedSystemId]: () => null,
    },
});

export const { set } = slice.actions
export default slice.reducer