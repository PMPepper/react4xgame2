import { Entity } from "types/game/shared/entities";


export default function getEntitiesByIds(ids: number[], entities: Record<number, Entity>) {
    return ids.map((id) => entities[id]);
}