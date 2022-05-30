import { useEffect } from "react";

//Hooks
import useRefCallback from 'hooks/useRefCallback';


//The hook
export default function useOnEsc(callback) {
    const onKeyDown = useRefCallback((event) => {
        event.which === 27 && callback?.(event);
    });

    useEffect(
        () => {
            window.addEventListener('keydown', onKeyDown);

            return () => {
                window.removeEventListener('keydown', onKeyDown);
            }
        },
        []
    );
}
