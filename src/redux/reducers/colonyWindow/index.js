import { combineReducers } from 'redux';

import selectedTab from './selectedTab';
import miningTab from './miningTab';


export default combineReducers({
    selectedTab,
    miningTab
});