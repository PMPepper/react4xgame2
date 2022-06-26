//TODO
//customise position (disance/offset)
//layout
import { Children, cloneElement, useState, useCallback, useEffect } from "react";
import PropTypes from 'prop-types';

//Components
import Bubble from "components/display/Bubble";
import Portal from "components/ui/Portal";
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";

//Hooks
import useElementPosition from "hooks/useElementPosition";
import useId from "hooks/useId";

//Other
import classes from './Tooltip.module.scss';
import {validAlignments} from 'hooks/usePositionedItem';

//Constants
const elementSizeOptions = {width: true, height: true, x: true, y: true};


//The component
export default function Tooltip({children, content, align, forceOpen}) {
    const [setElement, position] = useElementPosition(null, 0, elementSizeOptions);

    //State
    const [isMouseFocus, setIsMouseFocus] = useState(false);
    const [isKeyboardFocus, setIsKeyboardFocus] = useState(false);

    //Callbacks
    const onMouseEnter = useCallback(
        () => setIsMouseFocus(true),
        []
    );

    const onMouseLeave = useCallback(
        () => setIsMouseFocus(false),
        []
    );

    const onFocus = useCallback(
        () => setIsKeyboardFocus(true),
        []
    );

    const onBlur = useCallback(
        () => setIsKeyboardFocus(false),
        []
    );

    const onKeyDown = useCallback(
        (e) => {
            if(e.which === 27) {//if esc key pressed, close tooltip (if it's open)
                setIsMouseFocus(false);
                setIsKeyboardFocus(false);
            }
        },
        []
    );

    //Calculated values
    const child = Children.only(children);
    const id = useId(child.props.id);
    const tooltipId = `${id}-tooltip`;
    const renderChild = cloneElement(child, {ref: setElement, "aria-describedby": tooltipId, tabIndex: '0', onMouseEnter, onMouseLeave, onFocus, onBlur});
    // const isOpen = forceOpen === false ?
    //     false
    //     :
    //     forceOpen === true ?
    //         true
    //         :
    //         (isMouseFocus || isKeyboardFocus);
    const isOpen = forceOpen ?? (isMouseFocus || isKeyboardFocus);

    //Side effects
    useEffect(
        () => {
            window.addEventListener('keydown', onKeyDown);

            return () => window.removeEventListener('keydown', onKeyDown);
        },
        []
    );

    //Render
    return <>
        {renderChild}
        <Portal>
            <AbsolutelyPositioned fixed ref={setElement} positionRelativeTo={position} align={align} className={isOpen ? undefined : classes.closed}>{
                (alignment) => <Bubble role="tooltip" id={tooltipId} aligned={alignment}>
                    {content}
                </Bubble>
            }</AbsolutelyPositioned>
        </Portal>
    </>
}

Tooltip.defaultProps = {
    align: ['bottom-center', 'top-center', 'right-center', 'left-center'],
    forceOpen: null,
};

const oneOfValidAlignments = PropTypes.oneOf(Array.from(validAlignments));

Tooltip.propTypes = {
    align: PropTypes.oneOfType([
        oneOfValidAlignments,
        PropTypes.arrayOf(oneOfValidAlignments)
    ]),
    forceOpen: PropTypes.bool,
    content: PropTypes.node,
}

export const InlineTooltip = Tooltip.Inline = function InlineTooltip({children, ...props}) {
    return <Tooltip {...props}><span className={classes.inline}>{children}</span></Tooltip>
}