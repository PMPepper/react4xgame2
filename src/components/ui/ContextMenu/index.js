
//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";

//Hooks
import useOnClickOutside from "hooks/useOnClickOutside";
import useOnEsc from 'hooks/useOnEsc';
import { forwardRef } from "react";


//The component
const ContextMenu = forwardRef(function ContextMenu({position, children, onClose}, ref) {
    const clickOutsideRef = useOnClickOutside(onClose, ref);
    useOnEsc(onClose);

    return <AbsolutelyPositioned ref={clickOutsideRef} positionRelativeTo={position}>
        {children}
    </AbsolutelyPositioned>
});

export default ContextMenu