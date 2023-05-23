import AsyncConnection from "./AsyncConnection";
import WorkerTransport from "./AsyncConnection/WorkerTransport";

const transport = new WorkerTransport(globalThis as unknown as Worker);

const exposeMethods = {
    hello: async (name: string) => {
        await connector.isReady;

        await connector.call.shout('yo')
        await sleep(2000);

        return `Well hello there ${name}`
    }
}

const connector = new AsyncConnection<{shout: (string: string) => string}>(transport, exposeMethods);



function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}