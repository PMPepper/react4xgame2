import { useDispatch } from "react-redux";
import { AppDispatch } from "redux/reducers";


export default useDispatch as () => AppDispatch;