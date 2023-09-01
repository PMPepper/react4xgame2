import makeTabSlice from 'redux/factories/tab';

const {reducer, useHook} = makeTabSlice('colonyWindow.selectedTab')

export default reducer;

export const useSelectedTab = useHook;
