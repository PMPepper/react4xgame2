import { useEffect, useState, useCallback } from "react";

//Components
import Portal from "components/ui/Portal";
import getFocusableElements from "helpers/dom/get-focusable-elements";

//Consts
const root = document.body;


//The component
export default function Modal({children}) {
    const [[container, elementsMadeInert]] = useState(() => {
        //get all elements that aren't current inert
        const elementsToMakeInert = Array.from(root.children).filter(({inert}) => !inert);

        //Make them inert
        elementsToMakeInert.forEach((elem) => elem.inert = true);
        
        //Create a new container for the portal
        const container = document.createElement('div');
        root.appendChild(container);

        return [container, elementsToMakeInert];
    });

    //useCallback
    const onFocusStart = useCallback(
        () => {
            const focusableElements = getFocusableElements(container, true)

            if(focusableElements.length > 2) {
                focusableElements[focusableElements.length - 2].focus();
            } else {
                document.activeElement = null;
            }
        },
        []
    );

    const onFocusEnd = useCallback(
        () => {
            const focusableElements = getFocusableElements(container, true)

            if(focusableElements.length > 2) {
                focusableElements[1].focus();
            } else {
                document.activeElement = null;
            }
        },
        []
    );

    //Side effects
    useEffect(
        () => {
            return () => {
                //reset inert status of elements
                elementsMadeInert.forEach((elem) => elem.inert = false);
            };
        },
        []
    );

    //Render
    return <Portal container={container}>
        <span className="offscreen" tabIndex="0" onFocus={onFocusStart}></span>
        {children}
        <span className="offscreen" tabIndex="0" onFocus={onFocusEnd}></span>
    </Portal>
}
