import {Entity, EntitySystemBody as BaseEntitySystemBody, AllEntityTypes as BaseAllEntityTypes, isEntityOfType as isEntityOfTypeBase, EntityTypes} from './entities';
import { Position } from './game';
export {isEntityRenderable} from './entities'

export type {Entity, IEntityRenderable, EntityColony, EntityFaction, EntityPopulation, EntityResearchGroup, EntitySpecies, EntitySystem} from './entities';

export interface IPositionedEntity extends Entity {
    position: Position;
}

export interface EntitySystemBody extends BaseEntitySystemBody, Omit<IPositionedEntity, 'type'> {}

export function isPositionedEntity(entity: Entity): entity is IPositionedEntity {
    return !!(entity as any).position;
}

export type AllEntityTypes = Omit<BaseAllEntityTypes, 'systemBody'> & {systemBody: EntitySystemBody};

export function isEntityOfType<T extends EntityTypes>(entity: Entity, type: T): entity is AllEntityTypes[T] {
    return isEntityOfTypeBase<T, AllEntityTypes>(entity, type)
}