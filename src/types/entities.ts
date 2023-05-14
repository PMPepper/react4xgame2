import { ENTITY_TYPES } from "game/Consts";
import { FacetAvailableMinerals, FacetColony, FacetFaction, FacetMass, FacetMovement, FacetPopulation, FacetRender, FacetResearchGroup, FacetSpecies, FacetSystemBody } from "./facets";

export type EntityTypes = typeof ENTITY_TYPES[number];

export interface Entity {
    id: number;
    type: EntityTypes;
    facets: EntityFacets[];
}

export type EntityFacetTypes = {
    availableMinerals?: FacetAvailableMinerals;
    colony?: FacetColony;
    faction?: FacetFaction;
    mass?: FacetMass;
    movement?: FacetMovement;
    render?: FacetRender;
    species?: FacetSpecies;

    colonyId?: number;
    factionId?: number;
    systemId?: number;
    systemBodyId?: number;

    colonyIds?: number[];
    populationIds?: number[];
    systemBodyIds?: number[];
    researchGroupIds?: number[];
};

export type EntityFacets = keyof EntityFacetTypes;


//Entities with facet

export interface EntityColony extends Entity {
    type: 'colony';

    colony: FacetColony;

    factionId: number;
    systemBodyId: number;
    systemId: number;

    populationIds: number[];
    researchGroupIds: number[];
}

export interface EntitySystem extends Entity {
    type: 'system';
    colonyIds: number[];
    systemBodyIds: number[];
}

export interface EntitySystemBody extends Entity {
    type: 'systemBody';

    availableMinerals: FacetAvailableMinerals;
    mass: FacetMass;
    movement: FacetMovement;
    render: FacetRender;
    systemBody: FacetSystemBody;

    systemId: number;

    colonyIds: number[];
}

export interface EntityFaction extends Entity {
    type: 'faction';

    faction: FacetFaction;

    colonyIds: number[];
    populationIds: number[];
}

export interface EntitySpecies extends Entity {
    type: 'species';
    species: FacetSpecies;
    populationIds: number[];

}

export interface EntityPopulation extends Entity {
    type: 'population';

    population: FacetPopulation;

    colonyId: number;
    factionId: number;
    speciesId: number;
}

export interface EntityResearchGroup extends Entity {
    type: 'researchGroup';

    researchGroup: FacetResearchGroup;

    factionId: number;
    colonyId: number;
}

export type AllEntityTypes = {
    colony: EntityColony, 
    faction: EntityFaction,
    system: EntitySystem,
    systemBody: EntitySystemBody,
    species: EntitySpecies,
    population: EntityPopulation,
    researchGroup: EntityResearchGroup,
};

//If you start getting errors here, it might be because there has been a new entity type added without being added to AllEntityTypes
export function isEntityOfType<T extends EntityTypes>(entity: Entity, type: T): entity is AllEntityTypes[T] {
    return entity?.type === type;
}

//Type guards
// export function isColony(entity: Entity):entity is EntityColony {
//     return entity.type === 'colony';
// }

// export function isFaction(entity: Entity):entity is EntityFaction {
//     return entity.type === 'faction';
// }

// export function isSystem(entity: Entity):entity is EntitySystem {
//     return entity.type === 'system';
// }

// export function isSystemBody(entity: Entity):entity is EntitySystemBody {
//     return entity.type === 'systemBody';
// }

// export function isSpecies(entity: Entity):entity is EntitySpecies {
//     return entity.type === 'species';
// }

// export function isPopulation(entity: Entity):entity is EntityPopulation {
//     return entity.type === 'population';
// }


