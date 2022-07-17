import removeValue from "helpers/array/remove-value";

const disable = true;

const Performance = {
    mark: (name) => {
        return !disable && performance.mark(name);
    },
    measure: (name, startMark, endMark) => {
        return !disable && performance.measure(name,startMark, endMark);
    },
    getEntriesByName: (name) => {
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
    onData: (name, values) => {
        !disable && callbacks[name]?.forEach(callback => callback(values));
    },
    registerCallback: (name, callback) => {
        if(disable) {return}
        if(!callbacks[name]) {
            callbacks[name] = [];
        }

        callbacks[name].push(callback);
    },

    unregisterCallback: (name, callback) => {
        if(disable) {return}
        if(!callbacks[name]) {
            return false
        }

        removeValue(callbacks[name], callback);
    }
};

const callbacks = {};

export default Performance;