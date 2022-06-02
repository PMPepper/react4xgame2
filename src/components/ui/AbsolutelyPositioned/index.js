import { forwardRef } from 'react';

//Hooks
import useElementSize from 'hooks/useElementSize';
import useWindowSize from 'hooks/useWindowSize';
import usePositionedItem from 'hooks/usePositionedItem';
import { useMemo } from 'react';

import classNames from 'classnames';

//Other
import classes from './AbsolutelyPositioned.module.scss';


//The component
const AbsolutelyPositioned = forwardRef(function AbsolutelyPositioned({position, align, children, fixed = false}, ref) {
    const [sizeRef, dimensions, elem] = useElementSize(ref);
    const windowSize = useWindowSize();
    const [{x, y}] = usePositionedItem(position, dimensions, align, windowSize);//TODO return null if either position or dimensions are missing?

    const hasMeasuredSize = dimensions.width !== undefined;

    if(fixed) {
        console.log(hasMeasuredSize, y, dimensions, position);
    }
    //console.log(hasMeasuredSize, y, dimensions);

    const style = useMemo(
        () => ({left: `${x}px`, top: `${y}px`, visibility: hasMeasuredSize ? undefined : 'hidden'}),//hide until we have element size
        [x, y, hasMeasuredSize]
    );

    return <div ref={sizeRef} className={classNames(classes.root, fixed && classes.fixed)} style={style}>
        {children}
    </div>
})

AbsolutelyPositioned.defaultProps = {
    align: ['left', 'right', 'left-bottom', 'right-bottom']
}

export default AbsolutelyPositioned;