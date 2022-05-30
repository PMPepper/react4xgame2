import PropTypes from 'prop-types';

//Components
import Portal from "components/ui/Portal";
import { useEffect } from "react";

//Hooks
import useRefCallback from 'hooks/useRefCallback';
import useOnEsc from 'hooks/useOnEsc';

//Internal vars
let defaultContainer = document.getElementById('ft');
let defaultAppRoot = document.getElementById('app');


//The component
export default function FocusTrap({children, onClose, closeOnClickOutside = true, closeOnEsc = true, container = null, appRoot = null}) {
    appRoot = appRoot || defaultAppRoot;
    container = container || defaultContainer;

    //Callbacks
    const onMouseDown = useRefCallback((event) => {
        if(!closeOnClickOutside) {
            return;
        }

        if(event.target !== container && !container.contains(event.target)) {
            onClose(event);
        }
    });

    const onEsc = useRefCallback((event) => closeOnEsc && onClose?.(event));

    useOnEsc(onEsc);

    //Side effects
    useEffect(
        () => {
            appRoot.inert = true;

            return () => appRoot.inert = false;
        },
        [appRoot]
    )

    useEffect(
        () => {
            window.addEventListener('mousedown', onMouseDown);

            return () => {
                window.removeEventListener('mousedown', onMouseDown);
            }
        },
        [container]
    )

    //Render
    return <Portal container={container}>
        {children}
    </Portal>
}

FocusTrap.propTypes = {
    onClose: PropTypes.func,
    closeOnClickOutside: PropTypes.bool,
    closeOnEsc: PropTypes.bool, 
    container: PropTypes.instanceOf(HTMLElement),
    appRoot: PropTypes.instanceOf(HTMLElement),
};