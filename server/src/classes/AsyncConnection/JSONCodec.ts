import { Codec, AsyncMessageObject } from ".";

export type JSONReplacerReviver = (this: any, key: string, value: any) => any;

export class JSONCodec implements Codec {
    replacer: JSONReplacerReviver = null;
    reviver: JSONReplacerReviver = null;

    space: string;

    constructor(replacer?: JSONReplacerReviver, reviver?: JSONReplacerReviver, space?: string) {
        this.replacer = replacer;
        this.reviver = reviver;
        this.space = space;
    }

    async encode(data: AsyncMessageObject): Promise<any> {
        return JSON.stringify(data, this.replacer, this.space)
    }

    async decode(raw: any): Promise<AsyncMessageObject> {
        return JSON.parse(raw, this.reviver)
    }
}