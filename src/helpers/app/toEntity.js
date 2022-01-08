export default function toEntity(entity, entities) {
  if(!entity) {
    throw new Error('entity is required, was: '+entity);
  }

  return entities[(typeof(entity) !== 'object') ? entity : entity.id];
}
