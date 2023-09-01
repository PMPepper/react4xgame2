import makeDataTableReducer from "redux/factories/dataTable";

export type MiningProductionDataTableColumns = 'name' | 'species' | 'count' | 'speciesMod' | 'environmentalMod' | 'stabilityMod' | 'labourEfficiencyMod' | 'productionPerMine' | 'totalProductionPerMine' | 'totalProduction';

const {reducer, useHook} = makeDataTableReducer<MiningProductionDataTableColumns>('colonyWindow.miningTab.productionDataTable')

export default reducer;

export const useDataTable = useHook;