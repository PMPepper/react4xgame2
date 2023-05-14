import { ALL_FACETS } from "game/Consts";
import { Minerals, SystemBodyTypes } from "./definitions";
import { CapabilityTypes, AvailableMinerals } from "./game";

export type Facets = typeof ALL_FACETS[number];

export interface Facet {

};

export interface FacetAvailableMinerals extends Facet, AvailableMinerals {}

export interface FacetColony extends Facet {
    buildInProgress: {};//TODO
    buildQueue: [];//TODO
    capabilityProductionTotals: Record<CapabilityTypes, number>;
    minerals: Minerals;
    researchInProgress: {};//TODO
    structures: Record<number, Record<number, number>>;
    structuresWithCapability: Record<CapabilityTypes, Record<number, number>>;
}

export interface FacetMass extends Facet {
    value: number;
}

//TODO this will change as more movement types get added
export interface FacetMovement extends Facet {
    type: 'orbitRegular',
    radius: number;
    offset: number;
    orbitingId: number;
    period: number;
}

export interface FacetRender extends Facet {
    type: 'systemBody';//TODO are there more? This probably needs more adding to it
}

export interface FacetFaction extends Facet {
    colonyIds: number[];
    name: string;
    research: {};//TODO
    technology: {};//TODO
}

export interface FacetSystemBody extends Facet {
    type: SystemBodyTypes;
    albedo: number;
    axialTilt: number;
    children: number[];
    day: number;
    luminosity: number;
    position: number[];
    radius: number;
    tidalLock: boolean;
}

export interface FacetSpecies extends Facet {
    constructionRate: number;
    crewMod: number;
    growthRate: number;
    lifeSupportMod: number;
    miningRate: number;
    name: string;
    productionRate: number;
    researchRate: number;
    support: number;
    workerMod: number;
}

export interface FacetPopulation extends Facet {

    quantity: number,
    supportWorkers: number,
    effectiveWorkers: number,
    structuresWithCapability: Record<CapabilityTypes, Record<number, number>>,
    capabilityProductionTotals: Record<CapabilityTypes, number>,
    unitCapabilityProduction: Record<CapabilityTypes, Record<number, number>>,
    environmentalMod: number,
    stabilityMod: number,
    labourEfficiencyMod: number
}

export interface FacetResearchGroup extends Facet {
    structures: any;//TODO
    projects: any;//TODO
}

//TODO enforce completion..? E.g. make TS complain if I add a Facet and don't update this
export type AllFacets = {
    colony: FacetColony
    mass: FacetMass;
    availableMinerals: FacetAvailableMinerals;
    movement: FacetMovement;
    render: FacetRender;
    faction: FacetFaction;
    systemBody: FacetSystemBody;
    species: FacetSpecies;
    population: FacetPopulation;
    researchGroup: FacetResearchGroup;
}
