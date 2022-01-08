//import { createSlice } from '@reduxjs/toolkit'

import ClientState from 'game/ClientState';

export default function (state = null, action) {
    switch(action.type) {
        case 'gameState/set':
            return ClientState.fromState(action.payload.newGameState, action.payload.initialGameState);
        case 'gameState/update':
            return ClientState.mergeState(state, action.payload)

    }

    return state;
}

export function set(payload) {
    return {
        type: 'gameState/set',
        payload
    }
}

export function update(payload) {
    return {
        type: 'gameState/update',
        payload
    }
}

// export const slice = createSlice({
//     name: 'gameState',
//     initialState: null,
//     reducers: {
//         set: (state, {payload}) => {
//             return ClientState.fromState(payload.newGameState, payload.initialGameState);
//         },
//         update: (state, {payload}) => {
//             return ClientState.mergeState(state, payload)
//         },
//     },
// });

// export const { set, update } = slice.actions
// export default slice.reducer