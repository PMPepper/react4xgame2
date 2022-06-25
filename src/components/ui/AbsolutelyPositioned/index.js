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
const AbsolutelyPositioned = forwardRef(function AbsolutelyPositioned({positionRelativeTo, align, children, fixed = false}, ref) {
    const [sizeRef, dimensions] = useElementSize(ref);
    const windowSize = useWindowSize();
    const [itemPosition] = usePositionedItem(positionRelativeTo, dimensions, align, windowSize);

    const style = useMemo(
        () => itemPosition?.x === undefined ?
            {visibility: 'hidden'}
            :
            {left: `${itemPosition.x}px`, top: `${itemPosition.y}px`},//hide until we have a position
        [itemPosition?.x, itemPosition?.y]
    );

    return <div ref={sizeRef} className={classNames(classes.root, fixed && classes.fixed)} style={style}>
        {children}
    </div>
})

AbsolutelyPositioned.defaultProps = {
    align: ['bottom-center']
}

export default AbsolutelyPositioned;