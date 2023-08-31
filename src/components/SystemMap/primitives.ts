
import Pool from 'classes/Pool';

export type PrimitiveType = 'circle' | 'text' | 'rectangle';

export interface RenderPrimitiveBase {
  t: PrimitiveType;
  type: string;//Ideally would type this
  subType: string;//Ideally would type this
  x: number;
  y: number;
  id: string;
  opacity: number;
}

export class RenderCircle implements RenderPrimitiveBase {
    t: PrimitiveType = 'circle';
    type: string;
    subType: string;
    x: number;
    y: number;
    id: string;
    opacity: number;

    r: number;

    init(id: string, x: number, y: number, r: number, opacity: number, type: string, subType: string) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.r = r;
        this.opacity = opacity;
        this.type = type;
        this.subType = subType;

        return this;
    }
}

export class RenderRectangle implements RenderPrimitiveBase {
    t: PrimitiveType = 'rectangle';
    type: string;
    subType: string;
    x: number;
    y: number;
    id: string;
    opacity: number;
    
    width: number;
    height: number;

    init(id: string, x: number, y: number, width: number, height: number, opacity: number, type: string, subType: string) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.opacity = opacity;
        this.type = type;
        this.subType = subType;

        return this;
    }
}

export class RenderText implements RenderPrimitiveBase {
    t: PrimitiveType = 'text';
    type: string;
    subType: string;
    x: number;
    y: number;
    id: string;
    opacity: number;
    
    text: string;

    init(id: string, textVal: string, x: number, y: number, opacity: number, type: string, subType: string) {
        this.id = id;
        this.text = textVal;
        this.x = x;
        this.y = y;
        this.opacity = opacity;
        this.type = type;
        this.subType = subType;

        return this;
    }
}

export type RenderPrimitive = RenderCircle | RenderText | RenderRectangle;


//define object pools + generators
const circlePool = new Pool(RenderCircle, {preAllocate: 250});
const textPool = new Pool(RenderText, {preAllocate: 250});
const rectanglePool = new Pool(RenderText, {preAllocate: 250});

export const pools = {
    circle: circlePool,
    text: textPool,
    rectangle: rectanglePool,
} as const;


export function circle(id: string, x: number, y: number, r: number, opacity: number, type: string, subType: string): RenderCircle {
  return circlePool.get().init(id, x, y, r, opacity, type, subType);
}

export function text(id: string, textVal: string, x: number, y: number, opacity: number, type: string, subType: string): RenderText {
    return textPool.get().init(id, textVal, x, y, opacity, type, subType);
}

//Also RenderPosition - not really a primitive, but related
export class RenderPosition {
    id: number;
    x: number;
    y: number;
    position: number;

    init(id: number, x: number, y: number, position: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.position = position;

        return this;
    }
}

//entity position pool
export const positionsPool = new Pool(RenderPosition, {preAllocate: 250});

export function position(id: number, x: number, y: number, position: number): RenderPosition {
  return positionsPool.get().init(id, x, y, position);
}
