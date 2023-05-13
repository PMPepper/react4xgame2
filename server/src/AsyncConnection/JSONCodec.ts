import { Codec } from "./types";

//Not actually sure I want/need this?
export type JSONReplacerReviver = (this: any, key: string, value: any) => any;

export class JSONCodec<InputType> implements Codec<InputType, string> {
    readonly replacer?: JSONReplacerReviver;
    readonly reviver?: JSONReplacerReviver;
    readonly space?: string;

    constructor(replacer?: JSONReplacerReviver, reviver?: JSONReplacerReviver, space?: string) {
        this.replacer = replacer;
        this.reviver = reviver;
        this.space = space;
    }

    async encode(data: InputType): Promise<string> {
        return JSON.stringify(data, this.replacer, this.space)
    }

    async decode(raw: string): Promise<InputType> {
        return JSON.parse(raw, this.reviver)
    }
}