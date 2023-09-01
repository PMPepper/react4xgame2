import { Entity, EntityColony, isEntityOfType } from "types/game/client/entities";
import { RenderPosition, RenderPrimitive } from "../primitives";
import { FactionEntity } from "types/game/shared/game";
import { SystemMapDisplayOptions } from "redux/reducers/systemMapOptions";

export default function fleetRenderer(
    renderPrimitives: RenderPrimitive[], 
    entityScreenPositions: RenderPosition[], 
    windowSize: {width: number, height: number}, 
    x: number, y: number, zoom: number, 
    entity: Entity, entities: Record<number, Entity>, 
    factionEntities: Record<number, FactionEntity>, 
    colonies: Record<number, EntityColony<false>>, 
    options: SystemMapDisplayOptions
  ) {
    if(!isEntityOfType(entity, 'systemBody')) {
      throw new Error('Incorrect entity type');
    }
  
    //TODO
    const displayFleet = options.fleets
}