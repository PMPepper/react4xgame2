import Client from "game/Client";
import { FACTION_CLIENT_TYPES } from "game/Consts";
import { ServerMessageHandlers, ServerMessageTypes } from "game/server/ServerComms";
import { ConstructionProjectDefinition, ResearchDefinition, StructureDefinition, TechnologyDefinition } from "./definitions";
import { Entity, EntityFaction } from "./entities";

type ClientMessageType = string;//TODO list valid values

export interface Connector {
    setClient: (client: Client) => void;
    sendMessageToServer: <T extends ServerMessageTypes>(messageType: T, data: ServerMessageHandlers[T]['data']) => ServerMessageHandlers[T]['returns'];
    broadcastToClients: (messageType: ClientMessageType, data: any) => any;//TODO better typing here
    sendMessageToClient: (connectionId: number, messageType: ClientMessageType, data: any) => any;//TODO better typing here
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
    constructionProjects: Record<string, ConstructionProjectDefinition>;
    factions: Record<number, EntityFaction<TServer>>;
    minerals: Record<number, string>;
    research: Record<string, ResearchDefinition>;
    researchAreas: Record<number, string>;
    structures: Record<number, StructureDefinition>;
    technology: Record<string, TechnologyDefinition>;
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