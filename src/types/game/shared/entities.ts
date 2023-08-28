import { ENTITY_TYPES } from "game/Consts";
import { FacetAvailableMinerals, FacetColony, FacetFaction, FacetMass, FacetMovement, FacetPopulation, FacetRender, FacetResearchGroup, Facets, FacetSpecies, FacetSystemBody } from "./facets";
import { Position } from "./game";

export type EntityTypes = typeof ENTITY_TYPES[number];

export interface Entity {
    id: number;
    type: EntityTypes;
    facets: Facets[];
}

//////////////
// Entities //
//////////////

export interface EntityFleet<TServer extends boolean> extends Entity {
    type: 'fleet';
    position: Position | null
    movement: FacetMovement<TServer> | null;
    factionId: number;
    systemId: number;

    //TODO ships
}

export interface EntityColony<TServer extends boolean> extends Entity {
    type: 'colony';

    colony: FacetColony<TServer>;

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

export interface EntitySystemBody<TServer extends boolean> extends Entity {
    type: 'systemBody';

    availableMinerals: FacetAvailableMinerals<TServer>;
    mass: FacetMass<TServer>;
    movement: FacetMovement<TServer> | null;
    position: Position | null
    render: FacetRender<TServer>;
    systemBody: FacetSystemBody<TServer>;

    systemId: number;

    colonyIds: number[];
}

export interface EntityFaction<TServer extends boolean> extends Entity {
    type: 'faction';

    faction: FacetFaction<TServer>;

    colonyIds: number[];
    populationIds: number[];
}

export interface EntitySpecies<TServer extends boolean> extends Entity {
    type: 'species';
    species: FacetSpecies<TServer>;
    populationIds: number[];
}

export interface EntityPopulation<TServer extends boolean> extends Entity {
    type: 'population';

    population: FacetPopulation<TServer>;

    colonyId: number;
    factionId: number;
    speciesId: number;
}

export interface EntityResearchGroup<TServer extends boolean> extends Entity {
    type: 'researchGroup';

    researchGroup: FacetResearchGroup<TServer>;

    factionId: number;
    colonyId: number;
}

/////////////////////
// Entity 'groups' //
/////////////////////

export interface IEntityRenderable<TServer extends boolean> extends Entity {
    render: FacetRender<TServer>;
    systemId: number;
}

export interface IPositionedEntity extends Entity {
    position: Position | null;
}

export interface IMobileEntity<TServer extends boolean> extends IPositionedEntity {
    movement: FacetMovement<TServer> | null;
}

/////////////////
// AllEntities //
/////////////////

export type AllEntityTypes<TServer extends boolean> = {
    colony: EntityColony<TServer>;
    faction: EntityFaction<TServer>;
    system: EntitySystem;
    systemBody: EntitySystemBody<TServer>;
    species: EntitySpecies<TServer>;
    population: EntityPopulation<TServer>;
    researchGroup: EntityResearchGroup<TServer>;
    fleet: EntityFleet<TServer>;
};



