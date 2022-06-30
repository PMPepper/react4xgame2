

//Other
import defaultStyles from './Spreader.module.scss';

//Consts
const blank = <div />;


//The component
export default function Spreader({left = null, center = null, right = null, styles = defaultStyles}) {
    if(center) {
        left = left || blank;
        right = right || blank;
    } else if(right) {
        left = left || blank;
    }

    return <div className={styles.root}>
        {left}
        {center}
        {right}
    </div>
}