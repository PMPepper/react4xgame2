import { useMemo, memo } from "react";
import { Trans } from "@lingui/macro"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import cn from 'classnames';

//Components
import Spreader from "components/layout/Spreader";

//Hooks
import useDraggable from "hooks/useDraggable";

//Helpers

//Other
import defaultStyles from './Window.module.scss';

//Constants
const defaultCloseLbl = <Trans id="window.close">Close</Trans>

//The component
export default function Window({
    children,
    title,
    x, y, width, height,
    onRequestClose, onDrag, onResize,
    styles = defaultStyles,

    //Components
    component: Component = 'section',
    headerComponent: HeaderComponent = 'header',
    titleComponent: TitleComponent = 'h1',

    //Labels
    closeLbl = defaultCloseLbl
}) {
    const dragProps = useDraggable(onDrag);

    const style = useMemo(
        () => {
            return {
                "--window-x": `${x}px`,
                "--window-y": `${y}px`,
                "--window-width": `${width}px`,
                "--window-height": `${height}px`,
            };
        },
        [x, y, width, height]
    );

    return <Component style={style} className={styles.root}>
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
            <div className={styles.body}>{children}</div>
        </div>
        {onResize && <WindowResizeHandler styles={styles} onResize={onResize} />}
    </Component>
}

const WindowResizeHandler = memo(function WindowResizeHandler({styles, onResize}) {
    const dragPropsN = useDraggable((dx, dy) => onResize(dy, 0, 0, 0));
    const dragPropsNE = useDraggable((dx, dy) => onResize(dy, dx, 0, 0));
    const dragPropsE = useDraggable((dx, dy) => onResize(0, dx, 0, 0));
    const dragPropsSE = useDraggable((dx, dy) => onResize(0, dx, dy, 0));
    const dragPropsS = useDraggable((dx, dy) => onResize(0, 0, dy, 0));
    const dragPropsSW = useDraggable((dx, dy) => onResize(0, 0, dy, dx));
    const dragPropsW = useDraggable((dx, dy) => onResize(0, 0, 0, dx));
    const dragPropsNW = useDraggable((dx, dy) => onResize(dy, 0, 0, dx));

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