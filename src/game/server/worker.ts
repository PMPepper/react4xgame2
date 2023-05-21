import WorkerServer from './WorkerServer';

const workerServer = new WorkerServer(globalThis as unknown as Worker);

//global.onmessage