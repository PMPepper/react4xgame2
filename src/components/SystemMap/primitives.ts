
import objectpool from 'objectpool';
import { RenderCircle, RenderPosition, RenderText } from './types';

//define object pools + generators
export const circlePool = objectpool.generate({t: 'circle', id: undefined, x: 0, y: 0, r: 0, opacity: 0, type: null, subType: null}, {count: 250, regenerate: 1});
export const textPool = objectpool.generate({t: 'text', text: null, id: undefined, x: 0, y: 0, opacity: 0, type: null, subType: null}, {count: 250, regenerate: 1});

export function circle(id: string, x: number, y: number, r: number, opacity: number, type: string, subType: string): RenderCircle {
  const circle = circlePool.get();

  circle.id = id;
  circle.x = x;
  circle.y = y;
  circle.r = r;
  circle.opacity = opacity;
  circle.type = type;
  circle.subType = subType;

  return circle;
}

export function text(id: string, textVal: string, x: number, y: number, opacity: number, type: string, subType: string): RenderText {
  const text = textPool.get();

  text.id = id;
  text.text = textVal;
  text.x = x;
  text.y = y;
  text.opacity = opacity;
  text.type = type;
  text.subType = subType;

  return text;
}

//entity position pool
export const positionsPool = objectpool.generate(
  {id: undefined, x: 0, y: 0, r: 0},
  {
    count: 250,
    regenerate: 1
  }
);

export function position(id: string, x: number, y: number, r: number): RenderPosition {
  const position = positionsPool.get();

  position.id = id;
  position.x = x;
  position.y = y;
  position.r = r;

  return position;
}
