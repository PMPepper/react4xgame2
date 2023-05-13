import Client from "game/Client";
import { ConstructionProjectDefinition, ResearchDefinition, StructureDefinition, TechnologyDefinition } from "./definitions";

type MessageType = string;//TODO list valid values

export interface Connector {
    setClient: (client: Client) => void;
    sendMessageToServer: (messageType: MessageType, data: any) => any;//TODO better typing here
    // broadcastToClients: (messageType: MessageType, data: any) => any;//TODO better typing here
    // sendMessageToClient: (connectionId: number, messageType: MessageType, data: any) => any;//TODO better typing here
}

export type Entity = {

}

export interface EntityFaction extends Entity {

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