import { isEntityOfType } from "types/game/server/entities";
import { Entity } from "types/game/shared/entities";
import { FacetMovementOrbitRegular, IMovementOrbit } from "types/game/shared/movement";

//will cascade to all descendants
export function setSystemBodyPosition(systemBodyId:number, entities: Record<number, Entity>) {
    const systemBody = entities[systemBodyId];

    if(isEntityOfType(systemBody, 'systemBody')) {
        const parent = entities[(systemBody?.movement as IMovementOrbit<true>)?.orbitingId]

        if(!parent) {
            systemBody.systemBody.position = [];//doesn't orbit anything
            return;
        }

        if(!isEntityOfType(parent, 'systemBody')) {
            throw new Error('systemBody entity is not orbiting an entity of type systemBody');
        }

        systemBody.systemBody.position = [
            ...parent.systemBody.position,
            parent.systemBody.children.findIndex(id => id === systemBodyId)
        ]

        //update children
        systemBody.systemBody.children.forEach(id => setSystemBodyPosition(id, entities));
    } else {
        throw new Error('Supplied systemBodyId must be an entity of type systemBody')
    }
    
}

//returns true if orbitA is 'larger' than orbitB. Larger = highest maximum value
export function isOrbitLargerThan(orbitA: IMovementOrbit<true>, orbitB: IMovementOrbit<true>): boolean {
    return getOrbitMaxRadius(orbitA) > getOrbitMaxRadius(orbitB);
}

export function getOrbitMaxRadius(orbit: IMovementOrbit<true>) {
    switch(orbit.type) {
        case 'orbitRegular':
            return (orbit as FacetMovementOrbitRegular<true>).radius;
        default:
            throw new Error(`Unknown orbit type: ${orbit.type}`);
    }
}