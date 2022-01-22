import removeValue from "helpers/array/remove-value";

const Performance = {
    mark: (name) => {
        return performance.mark(name);
    },
    measure: (name, startMark, endMark) => {
        return performance.measure(name,startMark, endMark);
    },
    getEntriesByName: (name) => {
        const entries = performance.getEntriesByName(name, "measure");
        performance.clearMeasures(name);

        return entries;
    },

    getEntries: () => {
        const entries = performance.getEntriesByType("measure");
        performance.clearMeasures();

        return entries;
    },

    //Allow performance tracking of custom external data sources
    onData: (name, values) => {
        callbacks[name]?.forEach(callback => callback(values));
    },
    registerCallback: (name, callback) => {
        if(!callbacks[name]) {
            callbacks[name] = [];
        }

        callbacks[name].push(callback);
    },

    unregisterCallback: (name, callback) => {
        if(!callbacks[name]) {
            return false
        }

        removeValue(callbacks[name], callback);
    }
};

const callbacks = {};

export default Performance;