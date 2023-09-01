import makeDataTableReducer from "redux/factories/dataTable";

export type MineralsDataTableColumns = 'name' | 'quantity' | 'accessibility' | 'productionYear' | 'productionDay' | 'stockpile';

const {reducer, useHook} = makeDataTableReducer<MineralsDataTableColumns>('colonyWindow.miningTab.mineralsDataTable', (initialState) => ({...initialState, sortCol: 'name', sortDir: 'asc'}))

export default reducer;

export const useDataTable = useHook;