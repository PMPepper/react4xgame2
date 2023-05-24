import {ReadonlyDeep, SetRequired} from 'type-fest';
import { ALL_SYSTEM_BODY_TYPES } from "game/Consts";
import { CapabilityTypes, OrbitTypes } from "./game";
import { TDate } from 'types/dates';
import { PartialExcept } from 'types/utils';

export type SystemBodyTypes = typeof ALL_SYSTEM_BODY_TYPES[number];

/**
 * A mineral type ID
 */
export type MineralIdType = string;
/**
 * A structure type ID
 */
export type StructureIdType = string;
/**
 * A construction project type ID
 */
export type ConstructionProjectIdType = string;
/**
 * A research area ID
 */
export type ResearchAreaIdType = string;
/**
 * A research ID
 */
export type ResearchIdType = string;
/**
 * A technology ID
 */
export type TechnologyIdType = string;

/**
 * A species ID
 */
export type SpeciesId = string;
/**
 * A species ID
 */
export type SystemId = string;


//TODO more orbit types need definitions
export type OrbitDefinition = {
    type: OrbitTypes
};

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


    parent?: string,
    orbit?: OrbitDefinition
};

export type SystemDefinition = {
    name: string,
    bodies: SystemBodyDefinition[],
};

export type SpeciesDefinition = {
    name: string,
    growthRate: number,
    miningRate: number,
    researchRate: number,
    constructionRate: number,
    workerMod: number,
    crewMod: number,
    lifeSupportMod: number

    productionRate: number;
    support: number;
};

export type StartingSystemDefinition = {
    type: 'known',
    name?: string,

    bodyNamesMap?: Record<string, string>;//{[systemBodyDefinition.name]: faction name for this system body}
};

export type Structures = Record<StructureIdType, number>;
export type Minerals = Record<MineralIdType, number>;

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
export type IConstructionDefinition = {
    name: string;
    bp: number;
    minerals: Minerals;
}

export type StructureDefinition = {
    capabilities: Capabilities;
    mass: number;
    requireTechnologyIds: string[];
    upgrade: number[];
    workers: number;
} & IConstructionDefinition;

export type Capabilities = Partial<Record<CapabilityTypes, number>>
export type ModifyCapabilities = Partial<Record<CapabilityTypes, number>>

export type TechnologyDefinition = {
    name: string;
    modifyCapabilities?: ModifyCapabilities;
};

export type ResearchDefinition<ResearchAreaIds extends ResearchAreaIdType = ResearchAreaIdType, ResearchIds extends ResearchIdType = ResearchIdType, TechnologyIds extends TechnologyIdType = TechnologyIdType> = {
    area: ResearchAreaIds;
    cost: number;
    description: string;
    name: string;
    requireResearchIds: ResearchIds[];
    unlockTechnologyIds: TechnologyIds[];
};

export type ConstructionProjectDefinition = {
    producedStructures?: Record<StructureIdType, number>;
    requireTechnologyIds?: TechnologyIdType[];
    requiredStructures?: Structures;

    shipyard?: {
        isMilitary: boolean,
        capacity: number,
        slipways: number
    }
} & IConstructionDefinition;



type Equations = 'ex1' | 'ex2';//TODO actually define this list of equations
type EquationType = string;


type GameDefinitionTypes = 'new';




//This is the full set of data the createWorldFromDefinition will require
type BaseGameDefinition<
    MineralIds extends MineralIdType = MineralIdType, 
    StructureIds extends StructureIdType = StructureIdType, 
    ConstructionProjectIds extends ConstructionProjectIdType = ConstructionProjectIdType,
    ResearchAreaIds extends ResearchAreaIdType = ResearchAreaIdType,
    ResearchIds extends ResearchIdType = ResearchIdType,
    TechnologyIds extends TechnologyIdType = TechnologyIdType,
> = {
    type: GameDefinitionTypes,
    gameName: string,
    startDate: TDate,
    systems: Record<SystemId, SystemDefinition>,
    species: Record<SpeciesId, SpeciesDefinition>,
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


    //Not actually required
    //baseSpecies: Omit<SpeciesDefinition, 'name'>;//GameDefinitionOptions will merge species with this value, so they can be partially optional


    //This is what is currently coming from the baseGameDefinition
    equations: Record<Equations, EquationType>;
    
    minerals: Record<MineralIds, string>;//Am I going to the the 'numeric' template type?
    startingWorldMinerals: Record<MineralIds, {quantity: [number, number], access: [number, number]}>,
    systemBodyTypeMineralAbundance: Record<SystemBodyTypes, Record<MineralIds, number>>;

    structures: Record<StructureIds, StructureDefinition>;
    constructionProjects: Record<ConstructionProjectIds, ConstructionProjectDefinition>;

    researchAreas: Record<ResearchAreaIds, string>;//<<Id: name - should the name actually be handled by the language system, separately? Also, ReserachAreaIds could just be string, and this researchAreaIds[]
    research: Record<ResearchIds, ResearchDefinition<ResearchAreaIds, ResearchIds, TechnologyIds>>;
    technology: Record<TechnologyIds, TechnologyDefinition>
}



//This is the set of required and optional parameters needed to create a game
// export type GameDefinitionOptions = Partial<Omit<GameDefinition, 'species' | 'type' | 'gameName' | 'startDate'>> & {
//     type: GameDefinitionTypes;
//     gameName: string;
//     startDate: TDate;
//     systems: Record<SystemId, SystemDefinition>;
//     species: Record<SpeciesId, SetRequired<Partial<SpeciesDefinition>, 'name'>>;
// };

export type GameDefinition = ReadonlyDeep<BaseGameDefinition>;

export type GameDefinitionOptions = PartialExcept<Omit<BaseGameDefinition, 'species'>, 'type' | 'gameName' | 'startDate' | 'systems' | 'factions'> & {species: Record<SpeciesId, SetRequired<Partial<SpeciesDefinition>, 'name'>>;}



