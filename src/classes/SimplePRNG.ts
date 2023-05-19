


export default class SimplePRNG {
    _seed: number;

    constructor(seed: number) {
        if(!Number.isInteger(seed)) {
            throw new Error('seed must be an integer value');
        }

        this._seed = seed % 2147483647;
        
        if (this._seed <= 0) {
            this._seed += 2147483646;
        }
    }

    next = () => {
        const val = this._seed = this._seed * 16807 % 2147483647;

        return (val - 1) / 2147483646;
    }
}