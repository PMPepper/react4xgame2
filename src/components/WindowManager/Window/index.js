import { useMemo } from "react";
import { Trans } from "@lingui/macro"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import cn from 'classnames';

//Components
import Spreader from "components/layout/Spreader";

//Hooks

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
    const style = useMemo(
        () => {
            return {
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
            };
        },
        [x, y, width, height]
    );

    return <Component style={style} className={styles.root}>
        <HeaderComponent className={cn(styles.header, onDrag && style.drag)}>
            <Spreader
                left={title && <TitleComponent className={styles.title}>{title}</TitleComponent>}
                right={onRequestClose && <button className={styles.closeBtn} type="button" onClick={onRequestClose}>
                    <FontAwesomeIcon icon={solid('rectangle-xmark')} />
                    <span className="offscreen">{closeLbl}</span>
                </button>}
            />
        </HeaderComponent>
        {children}
    </Component>
}