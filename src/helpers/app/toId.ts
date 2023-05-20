import { Entity } from "types/game/shared/entities";

export default function toId(val: Entity | number): number {
  if(typeof(val) === 'object') {
    return val.id
  }

  return val;
}
