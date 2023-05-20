import { ALL_ORBIT_TYPES } from "game/Consts";
import { Combine } from "types/utils";
import { FacetMovement } from "./facets";
import { OrbitTypes } from "./game";


export type IMovementOrbit<TServer extends boolean> = Combine<FacetMovement<TServer>, {
    type: OrbitTypes;
    orbitingId: number;
}>;

export type FacetMovementOrbitRegular<TServer extends boolean> = Combine<IMovementOrbit<TServer>, {
    type: 'orbitRegular',
    radius: number;
    offset: number;
    period: number;
}>;

const orbitTypesSet = new Set(ALL_ORBIT_TYPES);

export function isOrbitType(type: any): type is OrbitTypes {
    return orbitTypesSet.has(type);
}

export function isFacetMovementOrbit<TServer extends boolean = false>(movementFacet?: FacetMovement<TServer>): movementFacet is IMovementOrbit<TServer> {
    return isOrbitType(movementFacet?.type);
}