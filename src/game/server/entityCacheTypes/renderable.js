export default function renderable(entities, ids) {
  return ids.reduce((output, id) => {
    const entity = entities[id];

    if(entity.render) {
      output.push(entity.id);
    }

    return output;
  }, []);
}
