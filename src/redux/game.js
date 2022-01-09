import { createSlice } from '@reduxjs/toolkit'

import {fromState, mergeState} from 'game/ClientState';

export const slice = createSlice({
    name: 'gameState',
    initialState: null,
    reducers: {
        set: (state, {payload}) => {
            return fromState(payload.newGameState, payload.initialGameState);
        },
        update: (state, {payload}) => {
            return mergeState(state, payload)
        },
    },
});

export const { set, update } = slice.actions
export default slice.reducer