import { useMemo } from "react";

//Helpers
import combineProps from "helpers/react/combine-props";


//The hook
export default function useCombineProps(getPropsFunc, deps) {
    return useMemo(
        () => combineProps(...getPropsFunc()),
        deps
    )
}