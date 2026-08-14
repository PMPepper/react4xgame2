import { forwardRef, useMemo } from 'react';
import classNames from 'classnames';

//Hooks
import useElementSize from 'hooks/useElementSize';
import useWindowSize from 'hooks/useWindowSize';
import usePositionedItem from 'hooks/usePositionedItem';

//Utils


//Other
import classes from './AbsolutelyPositioned.module.scss';
import combineProps from 'helpers/react/combine-props';


//The component
const AbsolutelyPositioned = forwardRef(function AbsolutelyPositioned({positionRelativeTo, align, children, fixed = false, ...rest}, ref) {
    const [sizeRef, dimensions] = useElementSize(ref);
    const windowSize = useWindowSize();
    const [itemPosition, alignment] = usePositionedItem(positionRelativeTo, dimensions, align, windowSize);

    const style = useMemo(
        () => itemPosition?.x === undefined ?
            {visibility: 'hidden'}
            :
            {left: `${itemPosition.x}px`, top: `${itemPosition.y}px`},//hide until we have a position
        [itemPosition?.x, itemPosition?.y]
    );

    const props = combineProps({
        ref: sizeRef,
        className: classNames(classes.root, fixed && classes.fixed),
        style
    }, rest);

    return <div {...props}>
        {children instanceof Function ? children(alignment) : children}
    </div>
})

AbsolutelyPositioned.defaultProps = {
    align: ['bottom-center']
}

export default AbsolutelyPositioned;