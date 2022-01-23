import Enum from "classes/Enum"

export default class ServerClient {
    id;
    name;
    type;
    ready;
    factions;
    factionId;
    gameTime;
    gameSpeed;
    isPaused;

    constructor(id, name, type, ready, factions, factionId, gameTime, gameSpeed = 1, isPaused = false) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.ready = ready;
        this.factions = factions;
        this.factionId = factionId;
        this.gameTime = gameTime;
        this.gameSpeed = gameSpeed;
        this.isPaused = isPaused;
    }
}

export const ENUM_CLIENT_TYPE = Enum.create('ClientType', ['local', 'remote', 'ai']);