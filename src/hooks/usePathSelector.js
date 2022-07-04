import { useSelector } from "react-redux";
import get from "lodash/get";


//The hook
export default function usePathSelector(path, selector, equalityFn = undefined) {
    return useSelector(state => selector(get(state, path)), equalityFn)
}