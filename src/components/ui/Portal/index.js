import { createPortal } from "react-dom";
import PropTypes from "prop-types";

//The components
export default function Portal({children, container}) {
    let node = null;

    if(typeof(container) === 'string') {
        node = document.querySelector(container);
    } else if(container instanceof Function) {
        node = container();
    } else {
        node = container;
    }

    return createPortal(children, node);
}

Portal.defaultProps = {
    container: document.body
};

Portal.propTypes = {
    container: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.instanceOf(HTMLElement)])
}