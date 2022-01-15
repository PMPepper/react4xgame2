
export const typeVals = {
    null: 0,
    undefined: 1,
    boolean: 2,
    bigint: 3,
    string: 4,
    symbol: 5,
    function: 6,
    array: 7,
    object: 8,

    //numbers
    int8: 9,
    int16: 10,
    int32: 11,
    uint8: 12,
    uint16: 13,
    uint32: 14,
    float: 15,
    NaN: 16,
    posInfinity: 17,
    negInfinity: 18,

    //TODO maps? sets? typed arrays?
};

export const valToType = Object.entries(typeVals).reduce((output, [key, value]) => {
    output[value] = key;

    return output;
}, [])