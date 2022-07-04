import { combineReducers } from "redux";

import mineralsDataTable from './mineralsDataTable';
import productionDataTable from './productionDataTable';


export default combineReducers({
    mineralsDataTable,
    productionDataTable,
})
