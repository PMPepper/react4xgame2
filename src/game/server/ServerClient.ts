import Enum from "classes/Enum"
import { ClientRole, ClientType } from "types/game/shared/game";

export default class ServerClient {
    id: number;
    name: string;
    type: ClientType;
    ready: boolean;
    factions: Record<number, ClientRole>;
    factionId: number;
    gameTime: number;
    gameSpeed: number;
    isPaused: boolean;

    constructor(id: number, name: string, type: ClientType, ready: boolean, factions: Record<number, ClientRole>, factionId: number, gameTime: number, gameSpeed: number = 1, isPaused: boolean = false) {
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
