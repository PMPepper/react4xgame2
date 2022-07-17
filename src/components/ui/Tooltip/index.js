//TODO
//customise position (disance/offset)
//layout
import { forwardRef, Children, cloneElement, useState, useCallback, useEffect } from "react";
import PropTypes from 'prop-types';

//Components
import Bubble from "components/display/Bubble";
import Portal from "components/ui/Portal";
import Truncate from "components/layout/Truncate";
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";

//Hooks
import useElementPosition from "hooks/useElementPosition";
import useId from "hooks/useId";
import useIsTruncated from "hooks/useIsTruncated";

//Helpers
import mergeRefs from "helpers/react/merge-refs";

//Other
import classes from './Tooltip.module.scss';
import {validAlignments} from 'hooks/usePositionedItem';


//Constants
const elementSizeOptions = {width: true, height: true, x: true, y: true};


//The component
//-forceOpen, defaults to null = standard behaviour. True = always visible, false = never visible
//disableAria [bool], defaults to false. True removes the aria properties and adds aria-hidden. Use when tooltip is purely for visual users
const Tooltip = forwardRef(function Tooltip({children, content, align, forceOpen, disableAria}, ref) {
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
    const renderChild = cloneElement(child, {
        ref: mergeRefs([setElement, child.ref, ref]), 
        //TODO merge other props?
        "aria-describedby": disableAria ? undefined : tooltipId, 
        tabIndex: '0', 
        onMouseEnter, onMouseLeave, onFocus, onBlur
    });

    const isOpen = forceOpen ?? (isMouseFocus || isKeyboardFocus);

    //Side effects
    useEffect(
        () => {
            window.addEventListener('keydown', onKeyDown);

            return () => window.removeEventListener('keydown', onKeyDown);
        },
        []
    );

    const bubbleProps = disableAria ?
        {
            'aria-hidden': 'true'
        }
        :
        {
            role: 'tooltip',
            id: tooltipId
        }

    //Render
    return <>
        {renderChild}
        <Portal>
            <AbsolutelyPositioned fixed ref={setElement} positionRelativeTo={position} align={align} className={isOpen ? undefined : classes.closed}>{
                (alignment) => <Bubble {...bubbleProps} aligned={alignment}>
                    {content}
                </Bubble>
            }</AbsolutelyPositioned>
        </Portal>
    </>
});

export default Tooltip;

Tooltip.defaultProps = {
    align: ['bottom-center', 'top-center', 'right-center', 'left-center'],
    forceOpen: null,
    disableAria: false,
};

const oneOfValidAlignments = PropTypes.oneOf(Array.from(validAlignments));

Tooltip.propTypes = {
    align: PropTypes.oneOfType([
        oneOfValidAlignments,
        PropTypes.arrayOf(oneOfValidAlignments)
    ]),
    forceOpen: PropTypes.bool,
    content: PropTypes.node,
    disableAria: PropTypes.bool,
}

export const InlineTooltip = Tooltip.Inline = function InlineTooltip({children, ...props}) {
    return <Tooltip {...props}><span className={classes.inline}>{children}</span></Tooltip>
}

export const OverflowTooltip = Tooltip.Overflow = function OverflowTooltip({children, ...props}) {
    const [ref, isTruncated] = useIsTruncated();
    
    return <Tooltip {...props} content={children} forceOpen={isTruncated ? null : false} disableAria><Truncate ref={ref}>{children}</Truncate></Tooltip>
}


