export default function factionSystemBodies(entities, ids) {
  return ids.reduce((output, id) => {
    const entity = entities[id];

    if(entity.factionSystemBody) {
      if(!output[entity.factionId]) {
        output[entity.factionId] = {};
      }

      if(!output[entity.factionId][entity.factionSystemId]) {
        output[entity.factionId][entity.factionSystemId] = [];
      }

      output[entity.factionId][entity.factionSystemId].push(entity.id);
    }

    return output;
  }, {});
}
