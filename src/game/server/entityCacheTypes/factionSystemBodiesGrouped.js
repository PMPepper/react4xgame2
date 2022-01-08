import getFactionSystemBodies from './factionSystemBodies';

export default function factionSystemBodies(entities, ids) {
  const factionSystemBodies = getFactionSystemBodies(entities, ids);
  const output = {};

  Object.keys(factionSystemBodies).forEach(factionId => {
    const systems = factionSystemBodies[factionId];
    output[factionId] = {};

    Object.keys(systems).forEach((factionSystemId) => {
      const factionSystemBodies = systems[factionSystemId];
      output[factionId][factionSystemId] = groupFactionSystemBodies(entities, factionSystemBodies)

    });
  });

  return output;
}


function groupFactionSystemBodies(entities, factionSystemBodyIds) {
  let rootSystemBodyGrouped = null;
  //let currentSystemBodyGrouped = null;
  const systemBodyIdToGrouped = {};

  factionSystemBodyIds.forEach(factionSystemBodyId => {
    const factionSystemBody = entities[factionSystemBodyId];
    const systemBody = entities[factionSystemBody.systemBodyId];

    const grouped = {
      id: factionSystemBodyId,
      systemBodyId: systemBody.id,
      children: []
    };

    //record this in lookup hash
    systemBodyIdToGrouped[systemBody.id] = grouped;

    if(rootSystemBodyGrouped === null) {
      rootSystemBodyGrouped = grouped;
    }

    if(systemBody.movement && systemBody.movement.orbitingId) {
      systemBodyIdToGrouped[systemBody.movement.orbitingId].children.push(grouped);
    }
  })

  return rootSystemBodyGrouped;
}
