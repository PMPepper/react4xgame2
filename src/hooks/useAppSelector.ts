import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "redux/reducers";


export default useSelector as TypedUseSelectorHook<RootState>;