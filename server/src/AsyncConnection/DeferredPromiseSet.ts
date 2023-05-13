



export default class DeferredPromiseSet<ReturnType> {
    readonly resolves: ((value: ReturnType | PromiseLike<ReturnType>) => void)[];
    readonly rejects: ((reason?: any) => void)[];

    constructor() {
        this.resolves = [];
        this.rejects = [];
    }

    get() {
        return new Promise<ReturnType>((resolve, reject) => {
            this.resolves.push(resolve);
            this.rejects.push(reject);
        })
    }

    resolve(value: ReturnType | PromiseLike<ReturnType>) {
        this.resolves.forEach((resolve) => resolve(value));

        this.resolves.length = 0;
        this.rejects.length = 0;
    }

    reject(reason?: any) {
        this.rejects.forEach((reject) => reject(reason));

        this.resolves.length = 0;
        this.rejects.length = 0;
    }
}