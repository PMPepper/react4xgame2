//TODO caching of results
import toEntity from "./toEntity";


//The helper
export default function getSystemBodyPosition(entity, entities, time, cache = null) {
    entity = toEntity(entity, entities);

    if(entity?.type !== 'systemBody') {
        throw new Error('Entity is not a systemBody');
    }

    if(!entity.movement) {
        return {x: 0, y: 0}
    }

    if(cache?.[entity.id]) {//if cache already contains value, use it
        return cache[entity.id];
    }

    let result = null;

    switch(entity.movement.type) {
        case 'orbitRegular':
            result = regularOrbitPositionAtTime(entity, entities, time);
            break;
        default:
            throw new Error('Unknown orbit type: '+entity.movement.type);
    }

    //If there is a cache, record value in it
    cache && (cache[entity.id] = result);

    return result;
}

function regularOrbitPositionAtTime(entity, entities, time) {
    if(!entity.movement.orbitingId) {
        throw new Error('Invalid orbit, orbit parent not specified');
    }

    const parent = entities[entity.movement.orbitingId];
    const orbit = entity.movement;

    const orbitRadius = orbit.radius;
    const orbitalPeriod = orbit.period;
    const orbitFraction = ((time + (orbitalPeriod * orbit.offset)) % orbitalPeriod)/orbitalPeriod;
    const orbitAngle = orbitFraction * Math.PI * 2;
    const position = entity.position;

    let newPositionX = orbitRadius * Math.cos(orbitAngle);
    let newPositionY = orbitRadius * Math.sin(orbitAngle);

    if(parent) {
        const parentPosition = getSystemBodyPosition(parent, entities, time);

        newPositionX += parentPosition.x;
        newPositionY += parentPosition.y;
    }
    
    return {x: newPositionX, y: newPositionY}
}