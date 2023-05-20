import { Entity } from "types/game/shared/entities";

export default function toEntity(entity: Entity | number, entities: Record<number, Entity>): Entity {
  if(!entity) {
    throw new Error('entity is required, was: '+entity);
  }

  return entities[(typeof(entity) !== 'object') ? entity : entity.id];
}
