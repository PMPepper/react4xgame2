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
});

export default store;
