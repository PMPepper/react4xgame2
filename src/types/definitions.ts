
export type SystemBodyTypes = 'star' | 'planet' | 'moon' | 'asteroid';

export type SystemBodyDefinition = {
    name: string,
    type: SystemBodyTypes,
    mass: number,
    radius: number,
    day: number,
    axialTilt: number,
    tidalLock: boolean,
    luminosity: number
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

export type StructuresDefinition = Record<string, number>;

export type StartingPopulationDefinition = {
    species: 'Humans',
    population: number,
    structures: StructuresDefinition
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
