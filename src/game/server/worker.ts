import WorkerServer from './WorkerServer';

const workerServer = new WorkerServer();

global.onmessage = workerServer.onmessage;
