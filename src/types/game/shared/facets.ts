import { ALL_FACETS } from "game/Consts";
import { Minerals, ResearchDefinition, SystemBodyTypes, TechnologyDefinition } from "./definitions";
import { CapabilityTypes, AvailableMinerals, BuildQueueItem, OrbitTypes, MovementTypes } from "./game";
import { Combine } from "types/utils";

export type Facets = typeof ALL_FACETS[number];

export type Facet<TServer extends boolean> = TServer extends true ? {
    lastUpdateTime: number
} : {};

export type FacetAvailableMinerals<TServer extends boolean> = Combine<Facet<TServer>, AvailableMinerals>;



export type FacetColony<TServer extends boolean> = Combine<Facet<TServer>, {
    buildInProgress: {};//TODO
    buildQueue: BuildQueueItem[];
    capabilityProductionTotals: Record<CapabilityTypes, number>;
    minerals: Minerals;
    researchInProgress: {};//TODO
    structures: Record<number, Record<number, number>>;
    structuresWithCapability: Record<CapabilityTypes, Record<number, number>>;
}>;

export type FacetMass<TServer extends boolean> = Combine<Facet<TServer>, {
    value: number;
}>;

export type FacetMovement<TServer extends boolean> = Combine<Facet<TServer>, {
    type: MovementTypes,
}>;

export type EntityRenderTypes = 'systemBody' | 'fleet';//TODO are there more? This probably needs more adding to it

export type FacetRender<TServer extends boolean> = Combine<Facet<TServer>, {
    type: EntityRenderTypes;
}>;

export type FacetFaction<TServer extends boolean> = Combine<Facet<TServer>, {
    colonyIds: number[];
    name: string;
    research: Record<string, boolean>;
    technology: Record<string, boolean>;
}>;

export type FacetSystemBody<TServer extends boolean> = Combine<Facet<TServer>, {
    type: SystemBodyTypes;
    albedo: number;
    axialTilt: number;
    children: number[];
    day: number;
    luminosity: number;
    position: number[];
    radius: number;
    tidalLock: boolean;
}>;

export type FacetSpecies<TServer extends boolean> = Combine<Facet<TServer>, {
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
}>;

export type FacetPopulation<TServer extends boolean> = Combine<Facet<TServer>, {
    quantity: number,
    supportWorkers: number,
    effectiveWorkers: number,
    structuresWithCapability: Record<CapabilityTypes, Record<number, number>>,
    capabilityProductionTotals: Record<CapabilityTypes, number>,
    unitCapabilityProduction: Record<CapabilityTypes, Record<number, number>>,
    environmentalMod: number,
    stabilityMod: number,
    labourEfficiencyMod: number
}>;

export type FacetResearchGroup<TServer extends boolean> = Combine<Facet<TServer>, {
    structures: any;//TODO
    projects: any;//TODO
}>;

export type FacetFleet<TServer extends boolean> = Combine<Facet<TServer>, {
    name: string;

    //TODO ships, etc
}>;


//TODO enforce completion..? E.g. make TS complain if I add a Facet and don't update this
export type AllFacets<TServer extends boolean> = {
    colony: FacetColony<TServer>
    mass: FacetMass<TServer>;
    availableMinerals: FacetAvailableMinerals<TServer>;
    movement: FacetMovement<TServer>;
    render: FacetRender<TServer>;
    faction: FacetFaction<TServer>;
    systemBody: FacetSystemBody<TServer>;
    species: FacetSpecies<TServer>;
    population: FacetPopulation<TServer>;
    researchGroup: FacetResearchGroup<TServer>;
}

/////////////////
// Type guards //
/////////////////

const allFacets = new Set(ALL_FACETS);

export function isFacetType(str: string): str is Facets {
    return allFacets.has(str as any);
}