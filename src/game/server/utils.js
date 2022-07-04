
//will cascade to all descendants
export function setSystemBodyPosition(systemBodyId, entities) {
    const systemBody = entities[systemBodyId];
    const parent = entities[systemBody?.movement?.orbitingId]

    if(!parent) {
        systemBody.systemBody.position = [];//doesn't orbit anything
        return;
    }

    systemBody.systemBody.position = [
        ...parent.systemBody.position,
        parent.systemBody.children.findIndex(id => id === systemBodyId)
    ]

    //update children
    systemBody.systemBody.children.forEach(id => setSystemBodyPosition(id, entities));
}

