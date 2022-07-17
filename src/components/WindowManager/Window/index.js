import { useMemo, memo, useState, useCallback } from "react";
import { Trans } from "@lingui/macro"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import cn from 'classnames';

//Components
import Spreader from "components/layout/Spreader";

//Hooks
import useDraggable from "hooks/useDraggable";
import useIsFocusWithin from "hooks/useIsFocusWithin";

//Helpers
import classnames from "helpers/css/class-list-to-string";

//Other
import defaultStyles from './Window.module.scss';

//Constants
const defaultCloseLbl = <Trans id="window.close">Close</Trans>

//The component
export default function Window({
    children,
    title,
    x, y, width, height, order,
    onInteract, onRequestClose, onDrag, onResize,
    styles = defaultStyles,

    //Components
    component: Component = 'section',
    headerComponent: HeaderComponent = 'header',
    titleComponent: TitleComponent = 'h1',

    //Labels
    closeLbl = defaultCloseLbl
}) {
    const dragProps = useDraggable(onDrag, getAbsoluteOffsetTopLeft);

    const [isFocusIn, setIsFocusIn] = useState(false);

    const onFocusHandler = useCallback(
        (e) => {
            onInteract(e);
            setIsFocusIn(true);
        },
        [onInteract]
    );

    const onBlurHandler = useCallback(
        () => {
            setIsFocusIn(false);
        },
        []
    );

    const onFocus = useIsFocusWithin(onFocusHandler, onBlurHandler);

    const style = useMemo(
        () => {
            return {
                "--window-x": `${x}px`,
                "--window-y": `${y}px`,
                "--window-width": `${width}px`,
                "--window-height": `${height}px`,
                "--window-order": order,
            };
        },
        [x, y, width, height, order]
    );

    return <Component style={style} className={classnames(styles.root, isFocusIn && styles.focusWithin)} onFocus={onFocus} tabIndex="-1">
        <div className={styles.content}>
            <HeaderComponent className={cn(styles.header, onDrag && styles.drag, onResize && styles.onResize)} {...dragProps}>
                <Spreader
                    left={title && <TitleComponent className={styles.title}>{title}</TitleComponent>}
                    right={onRequestClose && <button className={styles.closeBtn} type="button" onClick={onRequestClose}>
                        <FontAwesomeIcon icon={solid('rectangle-xmark')} />
                        <span className="offscreen">{closeLbl}</span>
                    </button>}
                />
            </HeaderComponent>
            <div className={styles.body} /*inert={isFocusIn ? undefined : 'inert'}*/>{children}</div>
        </div>
        {onResize && <WindowResizeHandler styles={styles} onResize={onResize} />}
    </Component>
}

const WindowResizeHandler = memo(function WindowResizeHandler({styles, onResize}) {
    const dragPropsN = useDraggable((x, y) => onResize(y, null, null, null), getAbsoluteOffsetBottomRight);
    const dragPropsNE = useDraggable((x, y) => onResize(y, x, null, null), getAbsoluteOffsetBottomLeft);
    const dragPropsE = useDraggable((x, y) => onResize(null, x, null, null), getAbsoluteOffsetBottomLeft);
    const dragPropsSE = useDraggable((x, y) => onResize(null, x, y, null), getAbsoluteOffsetTopLeft);
    const dragPropsS = useDraggable((x, y) => onResize(null, null, y, null), getAbsoluteOffsetTopLeft);
    const dragPropsSW = useDraggable((x, y) => onResize(null, null, y, x), getAbsoluteOffsetTopRight);
    const dragPropsW = useDraggable((x, y) => onResize(null, null, null, x), getAbsoluteOffsetTopRight);
    const dragPropsNW = useDraggable((x, y) => onResize(y, null, null, x), getAbsoluteOffsetBottomRight);

    return <>
        <div className={styles.resizeN} {...dragPropsN} />
        <div className={styles.resizeNE} {...dragPropsNE} />
        <div className={styles.resizeE} {...dragPropsE} />
        <div className={styles.resizeSE} {...dragPropsSE} />
        <div className={styles.resizeS} {...dragPropsS} />
        <div className={styles.resizeSW} {...dragPropsSW} />
        <div className={styles.resizeW} {...dragPropsW} />
        <div className={styles.resizeNW} {...dragPropsNW} />
    </>
});

//Internal helpers
function getAbsoluteOffsetTopLeft(e, clientX, clientY) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {x: clientX - rect.x, y: clientY - rect.y};
}

function getAbsoluteOffsetTopRight(e, clientX, clientY) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {x: clientX - rect.right, y: clientY - rect.y};
}

function getAbsoluteOffsetBottomRight(e, clientX, clientY) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {x: clientX - rect.right, y: clientY - rect.bottom};
}

function getAbsoluteOffsetBottomLeft(e, clientX, clientY) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {x: clientX - rect.x, y: clientY - rect.bottom};
}