import makeDataTableReducer from "redux/factories/dataTable";

const {reducer, hook} = makeDataTableReducer('colonyWindow.miningTab.mineralsDataTable', (initialState) => ({...initialState, sortCol: 'name', sortDir: 'asc'}))

export default reducer;

export const useDataTable = hook;