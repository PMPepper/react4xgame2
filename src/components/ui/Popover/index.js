import { forwardRef, useState, cloneElement, Children, useCallback, useRef } from "react";

//Components
import AbsolutelyPositioned from "components/ui/AbsolutelyPositioned";
import Portal from "components/ui/Portal";
import Modal from "components/ui/Modal";
import AutoFocus from "components/ui/AutoFocus";

//Hooks
import useElementPosition from "hooks/useElementPosition";
import useId from "hooks/useId";

//Helpers
import combineProps from "helpers/react/combine-props";
import classnames from "helpers/css/class-list-to-string";
import mergeRefs from "react-merge-refs";

//Other
import classes from './Popover.module.scss';

//Constants
const elementSizeOptions = {width: true, height: true, x: true, y: true};


//The component
const Popover = forwardRef(function Popover({
    //required props
    children, content, 
    
    modal, align, overlay, forceOpen,
    ...rest
}, ref) {
    const stateRef = useRef({});
    const [open, setOpen] = useState(false);
    const [setElement, position] = useElementPosition(null, 0, elementSizeOptions);

    const isOpen = forceOpen ?? open;

    //Calculated values
    const child = Children.only(children);
    const id = useId(child.props.id);
    const popoverId = `${id}-tooltip`;

    //Callbacks
    const onClick = useCallback(
        (e) => {
            stateRef.openerElem = e.target;
            setOpen(true)
        },
        []
    );

    const close = useCallback(
        () => {
            setOpen(false)

            if(stateRef.openerElem) {
                stateRef.openerElem.focus();
                stateRef.openerElem = null;
            }
        },
        []
    );

    const onClickOverlay = useCallback(
        (e) => {
            if(e.target === e.currentTarget) {
                close();
            }
        },
        []
    );

    const onKeyDownOverlay = useCallback(
        (e) => {
            if(e.which === 27) {
                e.stopPropagation();
                close();
            }
        },
        []
    );

    

    //Render
    const renderChild = cloneElement(child, 
        combineProps(
            child.props,
            rest,
            {
                ref: mergeRefs([setElement, ref]),
                "aria-haspopup": "dialog",
                "aria-expanded": isOpen,
                "aria-controls": isOpen ? popoverId : undefined,
                onClick,
            }
        )
    );

    const PortalOrModal = modal ? Modal : Portal;

    //Render
    return <>
        {renderChild}
        {isOpen && <PortalOrModal>
            <div className={classnames(classes.overlay, overlay && classes.visible)} onClick={onClickOverlay} onKeyDown={onKeyDownOverlay}>
                <AbsolutelyPositioned fixed ref={setElement} positionRelativeTo={position} align={align} className={isOpen ? undefined : classes.closed}>{
                    (alignment) => <AutoFocus><div className={classes.popover} role="dialog" id={popoverId} tabIndex="-1">{content}</div></AutoFocus>//TODO render prop, context, etc
                }</AbsolutelyPositioned>
            </div>
        </PortalOrModal>}
    </>
});

export default Popover;