import Rectangle from "classes/Rectangle";
import { useMemo } from "react";


// const validAlignments = new Set([
//     'left', 'left-top', 'left-center', 'left-bottom',
//     'right', 'right-top', 'right-center', 'right-bottom',
//     'top', 'top-left', 'top-center', 'top-right',
//     'bottom', 'bottom-left', 'bottom-center', 'bottom-right',
// ])
const defaultAlign = ['left', 'right', 'left-bottom', 'right-bottom'];

export default function usePositionedItem(
    positionRelativeTo,//the position of the point/item we are aligning to
    dimensions,//dimensions of the item that is being positioned
    align = defaultAlign,
    bounds = null,//bounds
) {
    const boundsRect = useMemo(
        () => bounds ? Rectangle.fromObj(bounds) : null,
        [bounds]
    );

    if(!(align instanceof Array)) {
        align = [align];
    }
    
    return useMemo(
        () => {
            if(!positionRelativeTo || !dimensions) {
                return [null, null];
            }

            const {x: px = 0, y: py = 0, width: pWidth = 0, height: pHeight = 0} = positionRelativeTo;//the position of the point/item we are aligning to
            const {x: dx = 0, y: dy = 0, width: dWidth = 0, height: dHeight = 0} = dimensions;//dimensions of the item that is being positioned

            let firstPosition = null;

            //For each alignment, check if the item can fit within the bounds
            for(let i = 0; i < align.length; i++) {
                const alignment = align[i];

                const position = getPositionAtAlignment(alignment, px, py, pWidth, pHeight, dx, dy, dWidth, dHeight);

                if(i === 0) {
                    firstPosition = position;
                }

                if(!bounds || checkBounds(position, boundsRect)) {
                    return [position, align]
                }
            }

            //if none fit, for now just resort to first defined position
            return [firstPosition, align[0]];
        },
        [align, positionRelativeTo?.x, positionRelativeTo?.y, positionRelativeTo?.width, positionRelativeTo?.height, dimensions?.x, dimensions?.y, dimensions?.width, dimensions?.height, boundsRect]
    );

}

function getPositionAtAlignment(alignment, px, py, pWidth, pHeight, dx, dy, dWidth, dHeight) {
    let x = 0;
    let y = 0;

    switch(alignment) {
        case 'left':
        case 'left-top':
        case 'left-center':
        case 'left-bottom':
        case 'top':
        case 'top-left':
        case 'bottom':
        case 'bottom-left':
            //aligning on the left in the x axis
            x = px - dWidth;
            break;
        case 'right':
        case 'right-top':
        case 'right-center':
        case 'right-bottom':
        case 'top-right':
        case 'bottom-right':
            //aligning on the right in the x axis
            x = px + pWidth;
            break;
        case 'top-center':
        case 'bottom-center':
            //aligning ot the center in the x axis
            x = px + (pWidth/2) + (-dWidth/2);
            break;
        default:
            throw new Error('Unknown alignment: ', alignment);
    }

    switch(alignment) {//Y axis
        case 'left':
        case 'left-top':
        case 'right':
        case 'right-top':
            y = py;
            break;
        case 'top':
        case 'top-left':
        case 'top-center':
        case 'top-right':
            //align to the top
            y = py - dHeight;
            break;
        case 'left-center':
        case 'right-center':
            //align to the center
            y = py + (pHeight/2) - (dHeight/2);
            break;
        case 'left-bottom':
        case 'right-bottom':
            y = py + pHeight - dHeight;
            break;
        case 'bottom':
        case 'bottom-left':
        case 'bottom-center':
        case 'bottom-right':
            //align to the bottom
            y = py + pHeight;
            break;
    }

/*case 'left':
        case 'left-top':
        case 'right':
        case 'right-top':
        case 'top':
        case 'top-left':
        case 'top-center':
        case 'top-right':
            //align to the top
            y = py;
            break;
        case 'left-center':
        case 'right-center':
            //align to the center
            y = py + (pHeight/2) - (dHeight/2);
            break;
        case 'left-bottom':
        case 'right-bottom':
        case 'bottom':
        case 'bottom-left':
        case 'bottom-center':
        case 'bottom-right':
            //align to the bottom
            y = py + pHeight - dHeight; */

    return new Rectangle(x, y, dWidth, dHeight);
}

function checkBounds(positionRect, boundsRect) {
    if(!boundsRect) {
        return true
    }

    return boundsRect.contains(positionRect)
}