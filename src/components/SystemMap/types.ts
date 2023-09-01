import { Entity, EntityColony } from "types/game/shared/entities";
import { FactionEntity } from "types/game/shared/game";
import { RenderPosition, RenderPrimitive } from "./primitives";
import { SystemMapDisplayOptions } from "redux/reducers/systemMapOptions";



export type SystemMapRendererProps = {
  renderPrimitives: RenderPrimitive[];
  styles: Record<string, string>, 
  x: number, 
  y: number, 
  zoom: number, 
  width: number, 
  height: number, 
  options: any;//TODO at some point this will be implemented
} & JSX.IntrinsicElements['div'];

export type EntityRenderer = (
    renderPrimitives: RenderPrimitive[], 
    entityScreenPositions: RenderPosition[], 
    windowSize: {width: number, height: number}, 
    x: number, y: number, zoom: number, 
    entity: Entity, 
    entities: Record<number, Entity>, 
    factionEntities: Record<number, FactionEntity>, 
    colonies: Record<number, EntityColony<false>>, 
    options: SystemMapDisplayOptions
) => void;
