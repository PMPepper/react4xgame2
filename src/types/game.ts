import Client from "game/Client";
import { ConstructionProjectDefinition, ResearchDefinition, StructureDefinition, TechnologyDefinition } from "./definitions";
import { Entity, EntityFaction } from "./entities";

type MessageType = string;//TODO list valid values

export interface Connector {
    setClient: (client: Client) => void;
    sendMessageToServer: (messageType: MessageType, data: any) => any;//TODO better typing here
    // broadcastToClients: (messageType: MessageType, data: any) => any;//TODO better typing here
    // sendMessageToClient: (connectionId: number, messageType: MessageType, data: any) => any;//TODO better typing here
}

export interface ClientState {
    id: number;
    name: string;

    factionId: number | null;
    factions: {};//TODO?
    gameSpeed: number;
    isPaused: number;
    ready: boolean;
    type: {//TODO define more client types e.g. AI, remote, etc
        name: 'local'
    }
}

export type FactionEntity = {
    id: number;
    intel: {};//?
    name: string;
    isSurveyed: boolean;
};


export type GameConfiguration = {
    clients: Record<number, Client>;
    constructionProjects: Record<string, ConstructionProjectDefinition>;
    factions: Record<number, EntityFaction>;
    minerals: Record<number, string>;
    research: Record<string, ResearchDefinition>;
    researchAreas: Record<number, string>;
    structures: Record<number, StructureDefinition>;
    technology: Record<string, TechnologyDefinition>;
};

export type GameState = {
    desiredGameSpeed: number;
    entities: Record<number, Entity>;
    entityIds: string[];
    factionEntities: Record<number, FactionEntity>;
    factionId: number;
    gameSpeed: number | undefined;
    gameTime: number;
    initialGameState: GameConfiguration;
    isPaused: boolean;
    knownSystems: FactionEntity[];
};


export type CapabilityTypes = 'mining' | 'construction' | 'research';

export type AvailableMinerals = {quantity: number, initialQuantity: number, access: number, initialAccess: number};