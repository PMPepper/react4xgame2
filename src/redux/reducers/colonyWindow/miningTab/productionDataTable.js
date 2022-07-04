import makeDataTableReducer from "redux/factories/dataTable";

const {reducer, hook} = makeDataTableReducer('colonyWindow.miningTab.productionDataTable')

export default reducer;

export const useDataTable = hook;