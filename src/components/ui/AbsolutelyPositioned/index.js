import { forwardRef } from 'react';

//Hooks
import useElementSize from 'hooks/useElementSize';
import useWindowSize from 'hooks/useWindowSize';
import usePositionedItem from 'hooks/usePositionedItem';
import { useMemo } from 'react';

//Other
import classes from './AbsolutelyPositioned.module.scss';


//The component
const AbsolutelyPositioned = forwardRef(function AbsolutelyPositioned({position, align, children}, ref) {
    const [sizeRef, dimensions] = useElementSize(ref);
    const windowSize = useWindowSize();
    const [{x, y}] = usePositionedItem(position, dimensions, align, windowSize);

    const style = useMemo(
        () => ({left: `${x}px`, top: `${y}px`}),
        [x, y]
    );

    return <div ref={sizeRef} className={classes.root} style={style}>
        {children}
    </div>
})

AbsolutelyPositioned.defaultProps = {
    align: ['left', 'right', 'left-bottom', 'right-bottom']
}

export default AbsolutelyPositioned;