import * as RenderFlags from '../renderFlags';
import {circle, text, position, RenderPrimitive, RenderPosition} from '../primitives';
import {
  outOfBoundsVCull, outOfBoundsHCull, startFadeRadius, fullyFadeRadius,
  startFadeOrbitRadius, fullyFadeOrbitRadius, startFadeLargeOrbit,
  fullyFadeLargeOrbit, systemBodyTypeMinRadius
} from 'components/game/GameConsts';
import { Entity, EntityColony, EntitySystemBody } from 'types/game/shared/entities';
import { FactionEntity } from 'types/game/shared/game';
import { isEntityOfType } from 'types/game/base/entityTypeGuards';
import { isFacetMovementOrbit } from 'types/game/shared/movement';
import { FacetMovementOrbitRegular } from 'types/game/shared/movement';
import { SystemMapDisplayOptions } from 'redux/reducers/systemMapOptions';


export default function systemBodyRenderer(
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

  const id = entity.id;
  const systemBody = entity.systemBody;
  const systemBodyDisplayOptions = options.bodies[systemBody.type];

  const parent = isFacetMovementOrbit(entity.movement)
    ? entities[entity.movement.orbitingId] as EntitySystemBody<false>
    : undefined;

  const hasMinerals = false;
  const hasColony = !!colonies[entity.id];

  const baseRadius = zoom * systemBody.radius;
  const cx = (entity.position.x - x) * zoom;
  const cy = (entity.position.y - y) * zoom;
  const r = Math.max(systemBodyTypeMinRadius[systemBody.type], baseRadius);
  let opacity = 1;

  let orbitOpacity = 1;

  //Which parts should be rendered?
  let displayBody = !!((systemBodyDisplayOptions.body & RenderFlags.ALL) || (hasColony && systemBodyDisplayOptions.body & RenderFlags.COLONY) || (hasMinerals && systemBodyDisplayOptions.body & RenderFlags.MINERALS))
  let displayLabel = !!((systemBodyDisplayOptions.label & RenderFlags.ALL) || (hasColony && systemBodyDisplayOptions.label & RenderFlags.COLONY) || (hasMinerals && systemBodyDisplayOptions.label & RenderFlags.MINERALS))
  let displayOrbit = !!(parent && ((systemBodyDisplayOptions.orbit & RenderFlags.ALL) || (hasColony && systemBodyDisplayOptions.orbit & RenderFlags.COLONY) || (hasMinerals && systemBodyDisplayOptions.orbit & RenderFlags.MINERALS)))

  //is visible on the screen?
  if(
    cx < -outOfBoundsVCull
    || cy < -outOfBoundsHCull
    || cx > windowSize.width + outOfBoundsVCull
    || cy > windowSize.height + outOfBoundsHCull
  ) {
    displayBody = false;//culled as out of bounds
    displayLabel = false;
  }

  //is too small to render
  if(baseRadius < fullyFadeRadius) {
    displayBody = false;//culled as out of bounds
    displayLabel = false;
    displayOrbit = false;
  } else if(baseRadius < startFadeRadius) {
    opacity = (baseRadius - fullyFadeRadius) / (startFadeRadius - fullyFadeRadius);
  }

  //Is the orbit of this entity too small to render?
  let orbitRadius = 0;
  let orbitX = 0;
  let orbitY = 0;

  if(isFacetMovementOrbit(entity.movement) && parent) {
    if(entity.movement.type === 'orbitRegular') {
      orbitRadius = (entity.movement as FacetMovementOrbitRegular<false>).radius * zoom;
      orbitX = (parent.position.x - x) * zoom;
      orbitY = (parent.position.y - y) * zoom;

      if(orbitRadius < fullyFadeOrbitRadius) {
        //orbital radius too small, do not render this system body
        displayBody = false;
        displayLabel = false;
        displayOrbit = false;
      } else if(orbitRadius < startFadeOrbitRadius) {
        opacity = Math.min(opacity, (orbitRadius - fullyFadeOrbitRadius) / (startFadeOrbitRadius - fullyFadeOrbitRadius));
      } else if(orbitRadius > fullyFadeLargeOrbit) {
        //hide really large orbits because rendering them causes issues in Chrome and Edge
        displayOrbit = false;
      } else if(orbitRadius > startFadeLargeOrbit) {
        orbitOpacity = 1 - ((orbitRadius - startFadeLargeOrbit) / (fullyFadeLargeOrbit - startFadeLargeOrbit));
      }

      if(displayOrbit) {
        //check if orbit is culled as out of bounds (add 1 pixel padding)
        if(
          orbitX < -orbitRadius - 1
          || orbitY < -orbitRadius - 1
          || orbitX > windowSize.width + orbitRadius + 1
          || orbitY > windowSize.height + orbitRadius + 1
        ) {
          //culled as out of bounds
          displayOrbit = false;
        }
      }
    } else {
      debugger;
      throw new Error('unsupported orbit type');
    }
    
  }

  //Output primitives
  if(displayOrbit) {
    renderPrimitives.push(circle(`${id}-orbit`, orbitX, orbitY, orbitRadius, Math.min(orbitOpacity, opacity), 'orbit', systemBody.type));
  }

  if(displayBody) {
    renderPrimitives.push(circle(`${id}-body`, cx, cy, r, opacity, 'systemBody', systemBody.type));
  }

  if(displayBody && hasColony && options.highlightColonies) {
    renderPrimitives.push(circle(`${id}-colonyHighlight`, cx, cy, r + 3, opacity, 'colonyHighlight', systemBody.type));
  }

  if(displayLabel) {
    const name = factionEntities[id]?.name || 'Unknown??';
    
    // render name
    name && renderPrimitives.push(text(`${id}-label`, name, cx, cy + r + 4, opacity, 'systemBodyLabel', systemBody.type));
  }

  //record position
  entityScreenPositions.push(position(entity.id, cx, cy, displayBody ? r : 0));
}
