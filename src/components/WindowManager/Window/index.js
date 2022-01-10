import { useMemo } from "react";
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
        {onResize && <>
            <div className={styles.resizeN} />
            <div className={styles.resizeNE} />
            <div className={styles.resizeE} />
            <div className={styles.resizeSE} />
            <div className={styles.resizeS} />
            <div className={styles.resizeSW} />
            <div className={styles.resizeW} />
            <div className={styles.resizeNW} />
        </>}
    </Component>
}