
// export default function toUint8Array(value) {
//     return Uint8Array.from(JSON.stringify(value));
// }

import convertTypedArray from './convert-typed-array';

//Constants
import {typeVals} from './constants';
var enc = new TextEncoder(); // always utf-8


export default function toUint8Array(value) {
    return Uint8Array.from(convertToUintData(value, []));
}

function convertToUintData(value, output) {
    const type = getType(value);

    output.push(typeVals[type])
    convertType[type](output, value);

    return output;
}

const convertType = {
    null: (output) => {},
    undefined: (output) => {},
    boolean: (output, value) => {output.push(+value)},
    int8: (output, value) => {
        output.push(value)
    },
    int16: (output, value) => {
        output.push(value >> 8 & 0xFF, value & 0xFF);
    },
    int32: (output, value) => {
        output.push(value >> 24 & 0xFF, value >> 16 & 0xFF, value >> 8 & 0xFF, value & 0xFF);
    },
    uint8: (output, value) => {
        output.push(value)
    },
    uint16: (output, value) => {
        output.push(value >> 8 & 0xFF, value & 0xFF);
    },
    uint32: (output, value) => {
        output.push(value >> 24 & 0xFF, value >> 16 & 0xFF, value >> 8 & 0xFF, value & 0xFF);
    },
    float: (output, value) => {
        const fltArr = convertTypedArray(Float64Array.from([value]), Uint8Array);
        
        output.push(...fltArr);
    },
    bigint: (output, value) => {
        throw new Error('Not implemented: bigint' );
        // const data = [];
        // //TODO get data

        // addLengthToOutput(output, data.length)
        // output.push(...data)

    },
    string: (output, value) => {
        const data = enc.encode(value);

        addLengthToOutput(output, data.length)
        output.push(...data);
    },
    symbol: (output, value) => {

        const data = [];
        //TODO get data

        addLengthToOutput(output, data.length)
        output.push(...data)
    },
    function: (output, value) => {

        const data = [];
        //TODO get data
        addLengthToOutput(output, data.length)
        
        output.push(...data)
    },
    array: (output, value) => {

        const data = [];
        
        value.forEach(element => {
            convertToUintData(element, data);
        });

        addLengthToOutput(output, data.length)
        output.push(...data);
    },
    object: (output, value) => {

        const data = [];
        //TODO get data

        addLengthToOutput(output, data.length)
        output.push(...data)
    },
    //TODO maps? sets? typed arrays?
};

function addLengthToOutput(output, length) {
    if(length > 0xFFFFFFFF) {
        throw new Error('Data too large!')
    }

    output.push(length >> 24 & 0xFF, length >> 16 & 0xFF, length >> 8 & 0xFF, length & 0xFF)
}

function getType(value) {
    const type = typeof(value);

    switch(type) {
        case 'undefined':
        case 'boolean':
        case 'bigint':
        case 'string':
        case 'symbol':
        case 'function':
            return type;
            case 'number':
                if(value === Number.POSITIVE_INFINITY) {
                    return 'posInfinity'
                }
    
                if(value === Number.NEGATIVE_INFINITY) {
                    return 'negInfinity';
                }
    
                if(isNaN(value)) {
                    return 'NaN';
                }
    
                if(Number.isInteger(value)) {
                    if(value < 0) {
                        //signed ints
                        if(value >= -0x7F) {
                            return 'int8';
                        }
    
                        if(value >= -0x7FFF) {
                            return 'int16';
                        }
    
                        if(value >= -0x7FFFFFFF) {
                            return 'int32';
                        }
                    } else {
                        //unsigned ints
                        if(value <= 0xFF) {
                            return 'uint8'
                        }
    
                        if(value <= 0xFFFF) {
                            return 'uint16';
                        }
    
                        if(value <= 0xFFFFFFFF) {
                            return 'uint32';
                        }
                    }
                }
    
                return 'float';
        case 'object':
            if(value === null) {
                return 'null';
            }

            if(value instanceof Array) {
                return 'array';
            }

            //TODO other types
            return 'object';
    }
}

// function mapFn(element) {
//     return element;
// }

// function objectToMap(obj) {
//     return new Map(Object.entries(obj));
// }