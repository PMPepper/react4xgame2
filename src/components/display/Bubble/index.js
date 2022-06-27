//
import { forwardRef } from "react";

//Helpers
import combineProps from "helpers/react/combine-props";
import classnames from "helpers/css/class-list-to-string";

//Other
import classes from './Bubble.module.scss';

//The component
const Bubble = forwardRef(function Bubble({children, aligned, ...rest}, ref) {
    const [side, position] = getArrowPosition(aligned);

    const props = combineProps(
        {
            ref,
            className: classnames(classes.bubble, classes[side], classes[position])
        },
        rest
    );

    return <div {...props}>{children}</div>
});

export default Bubble;

const positionMap = {
    left: 'start',
    center: 'middle',
    right: 'end',
    top: 'start',
    bottom: 'end'
};

function getArrowPosition(aligned) {
    if(!aligned) {
        return ['', '']
    }

    const [side, position] = aligned.split('-');

    return [side, positionMap[position] ?? 'start']
}