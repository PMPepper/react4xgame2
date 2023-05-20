//TODO move to game/utils?

//TODO caching of results
import { isEntityOfType } from "types/game/base/entityTypeGuards";
import { Entity, EntitySystemBody } from "types/game/shared/entities";
import { FacetMovement } from "types/game/shared/facets";
import { OrbitTypes, Position } from "types/game/shared/game";
import { FacetMovementOrbitRegular, isOrbitType } from "types/game/shared/movement";
import toEntity from "./toEntity";


//The helper
export default function getSystemBodyPosition(entity: Entity | number, entities: Record<number, Entity>, time: number, cache?: Record<number, Position>) {
    const entityObj = toEntity(entity, entities);

    if(!isEntityOfType(entityObj, 'systemBody')) {
        throw new Error('Entity is not a systemBody');
    }

    if(!entityObj.movement) {
        return {x: 0, y: 0}
    }

    if(cache?.[entityObj.id]) {//if cache already contains value, use it
        return cache[entityObj.id];
    }

    //SystemBody movement should always be an orbit type - TODO is this required? Will be fine for now
    if(!isOrbitType(entityObj.movement.type)) {
        throw new Error('System bodies only support orbit movement types');
    }

    const result = calculateOrbitPositions[entityObj.movement.type](entityObj, entities, time);

    //If there is a cache, record value in it
    cache && (cache[entityObj.id] = result);

    return result;
}

const calculateOrbitPositions: Record<OrbitTypes, (entity: EntitySystemBody<false>, entities: Record<number, Entity>, time: number) => Position> = {
    orbitRegular: (entity: EntitySystemBody<false>, entities: Record<number, Entity>, time: number): Position => {
        const orbit = entity.movement as FacetMovementOrbitRegular<false>;

        if(!orbit.orbitingId) {
            throw new Error('Invalid orbit, orbit parent not specified');
        }
    
        const parent = entities[orbit.orbitingId];
    
        const orbitRadius = orbit.radius;
        const orbitalPeriod = orbit.period;
        const orbitFraction = ((time + (orbitalPeriod * orbit.offset)) % orbitalPeriod)/orbitalPeriod;
        const orbitAngle = orbitFraction * Math.PI * 2;
    
        let newPositionX = orbitRadius * Math.cos(orbitAngle);
        let newPositionY = orbitRadius * Math.sin(orbitAngle);
    
        if(parent) {
            const parentPosition = getSystemBodyPosition(parent, entities, time);
    
            newPositionX += parentPosition.x;
            newPositionY += parentPosition.y;
        }
        
        return {x: newPositionX, y: newPositionY}
    }
}
