import { useMemo, useRef, useEffect } from "react";
import mergeRefs from "react-merge-refs";

//Helpers
import getFocusableElements from "helpers/dom/get-focusable-elements";


//The hook
export default function useAutoFocus(passthroughRef = null) {
    const ref = useRef();

    useEffect(
        () => {
            const elem = ref.current;

            const focusable = getFocusableElements(elem);

            if(focusable.length === 0) {
                elem.focus();
            } else {
                const firstAutofocus = focusable.find(elem => elem.getAttribute('autoFocus'));

                (firstAutofocus || focusable[0]).focus();
                
                setTimeout(() => {
                    (firstAutofocus || focusable[0]).focus();
                    console.log(document.activeElement);
                }, 0)
            }
        },
        []
    )

    return useMemo(
        () => mergeRefs([ref, passthroughRef]),
        [passthroughRef]
    )
}