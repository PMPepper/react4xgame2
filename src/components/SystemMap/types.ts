import { SystemBodyTypes } from "types/game/shared/definitions";
import { Entity, EntityColony } from "types/game/shared/entities";
import { FactionEntity } from "types/game/shared/game";
import { RenderPosition, RenderPrimitive } from "./primitives";



// export interface RenderCircle extends RenderPrimitiveBase {
//   r: number;
// }

// export interface RenderText extends RenderPrimitiveBase {
//   text: string;
// }

// export type RenderPrimitive = RenderCircle | RenderText;

// export type RenderPosition = {
//     id: number;
//     x: number;
//     y: number;
//     position: number;
// }


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


export type SystemMapSystemBodyOptions = {
    body: number;//renderFlags
    label: number;//renderFlags
    orbit: number;//renderFlags
};

export type SystemMapOptions = {
    highlightColonies: boolean;
    bodies: Record<SystemBodyTypes, SystemMapSystemBodyOptions>;
}

export type EntityRenderer = (
    renderPrimitives: RenderPrimitive[], 
    entityScreenPositions: RenderPosition[], 
    windowSize: {width: number, height: number}, 
    x: number, y: number, zoom: number, 
    entity: Entity, 
    entities: Record<number, Entity>, 
    factionEntities: Record<number, FactionEntity>, 
    colonies: Record<number, EntityColony<false>>, 
    options: SystemMapOptions
) => void;
