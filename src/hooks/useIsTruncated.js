
import { useCallback, useRef, useState } from "react";
import useAnimationFrame from "./useAnimationFrame";

export default function useIsTruncated(tolerance) {
    const ref = useRef();
    const [isTruncated, setIsTruncated] = useState(null);

    const checkIsTruncated = useCallback(
        () => {
            if(ref.current) {
                setIsTruncated(testIsTruncated(ref.current, tolerance))
            }
        },
        [tolerance]
    );

    useAnimationFrame(checkIsTruncated)

    return [ref, isTruncated]
}

function testIsTruncated(e, tolerance = 0) {
    return e.offsetWidth + tolerance < e.scrollWidth;
 }