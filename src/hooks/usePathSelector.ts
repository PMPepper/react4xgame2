import { EqualityFn, useSelector } from "react-redux";
import get from "lodash/get";


//The hook
export default function usePathSelector<T>(path: string | string[], selector: (state: any) => T, equalityFn: EqualityFn<any> = undefined): T {
    return useSelector(state => selector(get(state, path)), equalityFn)
}