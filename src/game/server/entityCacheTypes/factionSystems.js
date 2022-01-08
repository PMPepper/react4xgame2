export default function factionSystems(entities, ids) {
  return ids.reduce((output, id) => {
    const entity = entities[id];

    if(entity.factionSystem) {
      if(!output[entity.factionId]) {
        output[entity.factionId] = [];
      }

      output[entity.factionId].push(entity.id);
    }

    return output;
  }, {});
}
