import {isEntityOfType as baseIsEntityOfType, isEntityRenderable as baseIsEntityRenderable, isPositionedEntity as baseIsPositionedEntity} from '../base/entityTypeGuards';
import { AllEntityTypes, Entity, EntityTypes, IEntityRenderable } from '../shared/entities';

export * from '../shared/entities';

export const isEntityOfType = baseIsEntityOfType as <T extends EntityTypes>(entity: Entity, type: T) => entity is AllEntityTypes<false>[T];
export const isEntityRenderable = baseIsEntityRenderable as (entity: Entity) => entity is IEntityRenderable<false>;
export const isPositionedEntity = baseIsPositionedEntity;
