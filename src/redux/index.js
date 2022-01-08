import { configureStore } from '@reduxjs/toolkit';

import selectedSystemId from './selectedSystemId';
import game from './game';
import systemMapFollowing from './systemMapFollowing';
import systemMapOptions from './systemMapOptions';


const store = configureStore({
  reducer: {
    selectedSystemId,
    game,
    systemMapFollowing,
    systemMapOptions,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,//TEMP - need to refactor clientstate to not be a class,
      immutableCheck: false//TEMP - as above
    }),
});

export default store;
