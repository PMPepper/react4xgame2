import { AllEntityTypes, Entity, EntityTypes, IEntityRenderable, IPositionedEntity } from "../shared/entities";

//If you start getting errors here, it might be because there has been a new entity type added without being added to AllEntityTypes
export function isEntityOfType<T extends EntityTypes, TServer extends boolean>(entity: Entity, type: T): entity is AllEntityTypes<TServer>[T] {
    return entity?.type === type;
}

export function isEntityRenderable<TServer extends boolean = false>(entity: Entity): entity is IEntityRenderable<TServer> {
    return (entity as any).render && (entity as any).systemId
}

export function isPositionedEntity(entity: Entity): entity is IPositionedEntity {
    return (entity as any).position !== undefined;
}
