import { forwardRef, useEffect, useRef } from "react"
import mergeRefs from "react-merge-refs";


//The component
export default forwardRef(function Canvas({draw, ...props}, ref) {
    const canvasRef = useRef();

    useEffect(
        () => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            draw?.(context, canvas);
        },
        [draw]
    );

    return <canvas ref={mergeRefs([canvasRef, ref])} {...props} />
});
