import { combineReducers } from 'redux';

import selectedTab from './selectedTab';



export default combineReducers({
    selectedTab: selectedTab.reducer
});