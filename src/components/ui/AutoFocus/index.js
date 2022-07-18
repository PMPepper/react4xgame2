import { Children, cloneElement, forwardRef } from "react"
import mergeRefs from "react-merge-refs";

//Hooks
import useAutoFocus from "hooks/useAutoFocus";


//The component
const AutoFocus = forwardRef(function AutoFocus({children}, ref) {
    ref = useAutoFocus(ref);

    const child = Children.only(children);

    return cloneElement(child, {ref: mergeRefs([child.props.ref, ref])})
});

export default AutoFocus;