import { isEntityOfType } from "types/game/server/entities";
import { Entity } from "types/game/shared/entities";

//will cascade to all descendants
export function setSystemBodyPosition(systemBodyId:number, entities: Record<number, Entity>) {
    const systemBody = entities[systemBodyId];

    if(isEntityOfType(systemBody, 'systemBody')) {
        const parent = entities[systemBody?.movement?.orbitingId]

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

