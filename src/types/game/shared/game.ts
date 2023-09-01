import Client, { ClientMessageHandlers, ClientMessageType } from "game/Client";
import { ALL_ORBIT_TYPES, FACTION_CLIENT_TYPES } from "game/Consts";
import { ServerMessageHandlers, ServerMessageTypes } from "game/server/ServerComms";
import { ConstructionProjectDefinition, ConstructionProjectIdType, MineralIdType, ResearchAreaIdType, ResearchDefinition, ResearchIdType, StructureDefinition, StructureIdType, TechnologyDefinition, TechnologyIdType } from "./definitions";
import { Entity, EntityFaction } from "./entities";


//TODO need to track connected/ready status of connectors?

export interface ClientToServerConnector {
    setClient: (client: Client) => void;
    sendMessageToServer: <T extends ServerMessageTypes>(messageType: T, data: ServerMessageHandlers[T]['data']) => Promise<ServerMessageHandlers[T]['returns']>;
}

export interface ServerToClientsConnector {
    broadcastToClients: <T extends ClientMessageType>(messageType: T, data: Parameters<ClientMessageHandlers[T]>[0]) => void;//ReturnType<ClientMessageHandlers[T]>;//return type? Or is broadcast a one-way thing? Constrain to methods with return type = void
    sendMessageToClient: <T extends ClientMessageType>(connectionId: number, messageType: T, data: Parameters<ClientMessageHandlers[T]>[0]) => Promise<ReturnType<ClientMessageHandlers[T]>>;
}

export type ClientType = 'local' | 'remote' | 'ai';
export type ClientRole = typeof FACTION_CLIENT_TYPES[number];

export interface ClientState {
    id: number;
    name: string;

    factionId: number | null;
    factions: Record<number, ClientRole>;//{[factionId]: ClientRole}
    gameSpeed: number;
    isPaused: boolean;
    ready: boolean;
    type: {//TODO define more client types e.g. AI, remote, etc
        name: ClientType
    }
}

export type FactionEntity = {
    id: number;
    intel: {};//?
    name: string;
    isSurveyed: boolean;
};


export type GameConfiguration<TServer extends boolean> = {
    clients: Record<number, ClientState>;
    constructionProjects: Record<ConstructionProjectIdType, ConstructionProjectDefinition>;
    factions: Record<number, EntityFaction<TServer>>;
    minerals: Record<MineralIdType, string>;
    research: Record<ResearchIdType, ResearchDefinition>;
    researchAreas: Record<ResearchAreaIdType, string>;
    structures: Record<StructureIdType, StructureDefinition>;
    technology: Record<TechnologyIdType, TechnologyDefinition>;
};

export type ClientGameState = {
    desiredGameSpeed: number;
    entities: Record<number, Entity>;
    entityIds: string[];
    factionEntities: Record<number, FactionEntity>;
    factionId: number;
    gameSpeed: number | undefined;
    gameTime: number;
    initialGameState: GameConfiguration<false>;
    isPaused: boolean;
    knownSystems: FactionEntity[];//Is this correct?
};


export type CapabilityTypes = 'mining' | 'construction' | 'research';
export type OrbitTypes = typeof ALL_ORBIT_TYPES[number];
export type MovementTypes = OrbitTypes;//TODO add more

export type MineralAvailablility = {quantity: number, initialQuantity: number, access: number, initialAccess: number};
export type AvailableMinerals = Record<number, MineralAvailablility>;

export interface Position {
    x: number;
    y: number;
}

export type BuildQueueItem = {
    id: number,
    total: number,
    completed: number,
    constructionProjectId: number,
    assignToPopulationId: number,
    takeFromPopulationId: number
};

export type RelationshipTypes = 'self' | 'allied' | 'neutral' | 'enemy';
