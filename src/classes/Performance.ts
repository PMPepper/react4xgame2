import removeValue from "helpers/array/remove-value";

const disable = true;

const Performance = {
    mark: (name: string) => {
        return !disable && performance.mark(name);
    },
    measure: (name: string, startMark?: string, endMark?: string) => {
        return !disable && performance.measure(name,startMark, endMark);
    },
    getEntriesByName: (name: string) => {
        if(disable) {return}
        const entries = performance.getEntriesByName(name, "measure");
        performance.clearMeasures(name);

        return entries;
    },

    getEntries: () => {
        if(disable) {return []}
        const entries = performance.getEntriesByType("measure");
        performance.clearMeasures();

        return entries;
    },

    //Allow performance tracking of custom external data sources
    onData: (name: string, values: any) => {
        !disable && callbacks[name]?.forEach(callback => callback(values));
    },
    registerCallback: (name: string, callback: (...any) => any) => {
        if(disable) {return}
        if(!callbacks[name]) {
            callbacks[name] = [];
        }

        callbacks[name].push(callback);
    },

    unregisterCallback: (name: string, callback: (...any) => any) => {
        if(disable) {return}
        if(!callbacks[name]) {
            return false
        }

        removeValue(callbacks[name], callback);
    }
};

const callbacks: Record<string, ((...any) => any)[]> = {};

export default Performance;