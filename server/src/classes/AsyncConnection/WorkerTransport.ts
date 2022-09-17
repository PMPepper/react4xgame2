//TODO implement
import { AsyncTransport, Codec, AsyncConnectionStatus } from ".";
import { JSONCodec } from "./JSONCodec";


export default class WorkerTransport implements AsyncTransport {
    defaultCodec: Codec = new JSONCodec();

    onConnected(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    onMessage(raw: any): void {
        throw new Error("Method not implemented.");
    }
    sendMessage(data: any): void {
        throw new Error("Method not implemented.");
    }

    getConnectionStatus(): AsyncConnectionStatus {
        return AsyncConnectionStatus.Connecting;//TODO
    }
}
