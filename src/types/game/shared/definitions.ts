import { ALL_SYSTEM_BODY_TYPES } from "game/Consts";
import { CapabilityTypes } from "./game";

export type SystemBodyTypes = keyof typeof ALL_SYSTEM_BODY_TYPES;

export type SystemBodyDefinition = {
    name: string,
    type: SystemBodyTypes,
    mass: number,
    radius: number,
    day: number,
    axialTilt: number,
    tidalLock: boolean,
    luminosity: number;
    albedo: number;
};

export type SystemDefinition = {
    name: string,
    bodies: SystemBodyDefinition[],
};

export type SpeciesDefinition = {
    name: string,
    growthRate: number,//optional?
    miningRate: number,//optional?
    researchRate: number,//optional?
    constructionRate: number,//optional?
    workerMod?: number,
    crewMod?: number,
    lifeSupportMod?: number
};

export type StartingSystemDefinition = {
    type: 'known',
    name?: string,
};

export type Structures = Record<number, number>;
export type Minerals = Record<number, number>;

export type StartingPopulationDefinition = {
    species: 'Humans',
    population: number,
    structures: Structures;
};

export type StartingColonyDefinition = {
    isStartingWorld: boolean,
    isSurveyed: boolean,
    system: string,//ID from systemsSystems object (the key)
    body: string,//body ID (what if random?)
    populations: StartingPopulationDefinition[]
};

export type FactionDefintion = {
    name: string,
    startingResearch: [],
    startingSystems: Record<string, StartingSystemDefinition>,
    startingColonies: StartingColonyDefinition[],
};

export type StructureDefinition = {
    bp: number;
    capabilities: Capabilities;
    mass: number;
    minerals: Minerals;
    name: string;
    requireTechnologyIds: string[];
    upgrade: number[];
    workers: number;
};

export type Capabilities = Partial<Record<CapabilityTypes, number>>

export type ModifyCapabilities = Partial<Record<CapabilityTypes, number>>

export type TechnologyDefinition = {
    name: string;
    modifyCapabilities?: ModifyCapabilities;
};

export type ResearchDefinition = {
    area: number;
    cost: number;
    description: string;
    name: string;
    requireResearchIds: string[];
    unlockTechnologyIds: string[];
};

export type ConstructionProjectDefinition = {
    bp: number;
    minerals: Minerals;
    name: string;
    producedStructures: Record<number, number>;
    requireTechnologyIds?: string[];
    requiredStructures: Structures
};

//TODO I think a bunch is missing from this..
//Actually, this gets combined with a default set of values
//So really I need to define the 'final' set, and the required + optional
export type GameDefinition = {
    type: 'new',
    gameName: 'flobble',
    startDate: '2000-01-01T00:00:00',
    systems: Record<string, SystemDefinition>,
    species: Record<string, SpeciesDefinition>,
    factions: FactionDefintion[],
  
    //TODO
    //To be implemented
    //system generation properties
    numSystems: number,
    wrecks: number,
    ruins: number,
  
    //threats
    swarmers: number,
    invaders: number,//probably will be more fine-tuned
    sentinels: number,
}
