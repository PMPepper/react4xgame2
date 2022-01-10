import { useCallback, useMemo, useEffect, useRef } from "react";



export default function useDraggable(onDrag) {
    const ref = useRef({x: null, y: null, onDrag});

    ref.current.onDrag = onDrag;

    //Callbacks
    const onMouseDown = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();

            ref.current.x = e.clientX
            ref.current.y = e.clientY;

            window.addEventListener('mousemove', onDragMove);
            window.addEventListener('mouseup', onDragEnd);
        },
        []
    );

    const onDragMove = useCallback(
        ({clientX, clientY}) => {
            onDrag(clientX - ref.current.x, clientY - ref.current.y);

            ref.current.x = clientX;
            ref.current.y = clientY;
        },
        []
    )

    const onDragEnd = useCallback(
        () => {
            window.removeEventListener('mousemove', onDragMove);
            window.removeEventListener('mouseup', onDragEnd);
        },
        []
    )

    //Side effects
    useEffect(
        () => onDragEnd,//tidy up on unload
        []
    )


    return useMemo(
        () => !!onDrag ? 
            ({onMouseDown})
            :
            null,
        [!!onDrag]
    )
}