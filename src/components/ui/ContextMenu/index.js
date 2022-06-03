import {useContext, createContext, forwardRef} from "react";

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import Portal from "components/ui/Portal";

//Hooks
import useOnClickOutside from "hooks/useOnClickOutside";
import useOnEsc from 'hooks/useOnEsc';

//Consts
const ContextMenuContext = createContext();
ContextMenuContext.displayName = 'ContextMenuContext';


//The component
const ContextMenu = forwardRef(function ContextMenu({position, children, onClose}, ref) {
    const clickOutsideRef = useOnClickOutside(onClose, ref);
    useOnEsc(onClose);

    return <Portal>
        <ContextMenuContext.Provider value={onClose}>
            <AbsolutelyPositioned ref={clickOutsideRef} positionRelativeTo={position}>
                {children instanceof Function ? children(onClose) : children}
            </AbsolutelyPositioned>
        </ContextMenuContext.Provider>
    </Portal>
});

export default ContextMenu;

export const useOnCloseContextMenu = ContextMenu.useOnCloseContextMenu = () => useContext(ContextMenuContext)

