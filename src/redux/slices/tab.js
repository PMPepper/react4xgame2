import { createSlice } from '@reduxjs/toolkit';

const initialState = 0;

const reducers = {
    setSelectedIndex(state, {payload}) {
        return payload
    }
};

export default function makeTabReducer(name) {
    return createSlice({
        name,
        initialState,
        reducers,
    })
}