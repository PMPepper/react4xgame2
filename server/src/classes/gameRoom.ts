import Player from './player';

interface GameOptions {
    isPrivate?: boolean,
    password?: string,
}


export default class GameRoom {
    name: string;
    numSlots: number;
    isPrivate: boolean
    password: string
    players: Array<Player>

    constructor(name, slots, {isPrivate = false, password = null}: GameOptions = {}) {
        this.name = name;
        this.numSlots = slots;
        this.isPrivate = isPrivate;
        this.password = password;

        this.players = [];
    }
}