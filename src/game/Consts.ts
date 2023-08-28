export const DAY_ANNUAL_FRACTION = 1/365.25

export const ALL_SYSTEM_BODY_TYPES = ['star', 'planet', 'moon', 'asteroid', 'gasGiant', 'dwarfPlanet'] as const;
export const ALL_ORBIT_TYPES = ['orbitRegular'] as const;

export const ALL_FACETS = ['colony', 'mass', 'availableMinerals', 'movement', 'render', 'faction', 'systemBody', 'species', 'population', 'researchGroup'] as const;
export const ENTITY_TYPES = ['colony', 'faction', 'system', 'systemBody', 'species', 'population', 'researchGroup', 'fleet'] as const;

export const FACTION_CLIENT_TYPES =  ['OWNER', 'SPECTATOR'] as const;