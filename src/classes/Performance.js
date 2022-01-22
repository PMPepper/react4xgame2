const Performance = {
    mark: (name) => {
        return performance.mark(name);
    },
    measure: (name, startMark, endMark) => {
        return performance.measure(name,startMark, endMark);
    },
    getEntriesByName: (name, type) => {
        return performance.getEntriesByName(name, type);
    },
};

export default Performance;