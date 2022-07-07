

export default function getEntitiesByIds(ids, entities) {
    return ids.map((id) => entities[id]);
}