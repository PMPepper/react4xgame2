import makeTabSlice from 'redux/factories/tab';

const {reducer, hook} = makeTabSlice('colonyWindow.selectedTab')

export default reducer;

export const useSelectedTab = hook;
