import { configureStore } from '@reduxjs/toolkit';

import selectedSystemId from './selectedSystemId';
import systemMapFollowing from './systemMapFollowing';
import systemMapOptions from './systemMapOptions';

import colonyWindow from './colonyWindow';


const store = configureStore({
  reducer: {
    selectedSystemId,
    systemMapFollowing,
    systemMapOptions,
    colonyWindow,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store['dispatch']