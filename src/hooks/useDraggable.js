import { useCallback, useMemo, useEffect, useRef } from "react";



//If getAbsoluteOffset is supplied, assume absolute mode
export default function useDraggable(onDrag, getAbsoluteOffset = null) {
    const ref = useRef({x: null, y: null, initialX: null, initialY: null, onDrag, getAbsoluteOffset});

    ref.current.onDrag = onDrag;
    ref.current.getAbsoluteOffset = getAbsoluteOffset;

    //Callbacks
    const onMouseDown = useCallback(
        (e) => {
            //e.preventDefault();
            
            if(ref.current.getAbsoluteOffset) {
                ref.current.offset = ref.current.getAbsoluteOffset(e, e.clientX, e.clientY)
            } else {
                ref.current.x = e.clientX
                ref.current.y = e.clientY;
            }
            

            window.addEventListener('mousemove', onDragMove);
            window.addEventListener('mouseup', onDragEnd);
        },
        []
    );

    const onDragMove = useCallback(
        (e) => {
            const {clientX, clientY} = e;
            e.preventDefault();
            e.stopPropagation();

            if(ref.current.getAbsoluteOffset) {
                onDrag(clientX - ref.current.offset.x, clientY - ref.current.offset.y);
            } else {
                onDrag(clientX - ref.current.x, clientY - ref.current.y);

                ref.current.x = clientX;
                ref.current.y = clientY;
            }
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