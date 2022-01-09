import { configureStore } from '@reduxjs/toolkit';

import selectedSystemId from './selectedSystemId';
import systemMapFollowing from './systemMapFollowing';
import systemMapOptions from './systemMapOptions';


const store = configureStore({
  reducer: {
    selectedSystemId,
    systemMapFollowing,
    systemMapOptions,
  },
});

export default store;
