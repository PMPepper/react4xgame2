
//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";

//Hooks
import useOnClickOutside from "hooks/useOnClickOutside";
import useOnEsc from 'hooks/useOnEsc';


//The component
export default function ContextMenu({position, children, onClose}) {
    const ref = useOnClickOutside(onClose);
    useOnEsc(onClose);

    return <AbsolutelyPositioned ref={ref} position={position}>
        {children}
    </AbsolutelyPositioned>
}