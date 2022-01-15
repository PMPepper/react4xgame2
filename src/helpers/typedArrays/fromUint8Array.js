//Constants
import {typeVals, valToType} from './constants';
var dec = new TextDecoder("utf-8");


export default function fromUint8Array(array) {
    return convertType(array, {index: 0});
}

function convertType(array, indexRef) {
    const typeVal = array[indexRef.index];
    const type = valToType[typeVal];

    indexRef.index++;

    return convertTypeByType[type](array, indexRef);
}


const convertTypeByType = {
    null: () => null,
    undefined: () => undefined,
    boolean: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index++;

        return !!array[index]
    },
    int8: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index++;

        return array[index] - 0x100;
    },
    int16: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index += 2;
        
        return ((array[index] << 8) + array[index+1]) - 0x10000;
    },
    int32: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index+=4;

        return ((array[index] << 24) + (array[index+1] << 16) + (array[index+2] << 8) + array[index+3]);
    },
    uint8: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index++;

        return array[index]
    },
    uint16: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index += 2;

        return (array[index] << 8) + array[index+1];
    },
    uint32: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index+=4;

        return (array[index] << 24) + (array[index+1] << 16) + (array[index+2] << 8) + array[index+3];
    },
    float: (array, indexRef) => {
        const index = indexRef.index;
        indexRef.index+=8;

        const fltArr = new Float64Array(array.buffer.slice(index, index + 8))

        return fltArr[0];
    },
    bigint: (array, indexRef) => {
        throw new Error('Not implemented: bigint');
    },
    string: (array, indexRef) => {
        const length = getLength(array, indexRef);
        const endIndex = indexRef.index + length;

        const strArr = new Uint8Array(array.buffer.slice(indexRef.index, endIndex));

        indexRef.index = endIndex;
        return dec.decode(strArr);
    },
    symbol: (array, indexRef) => {
        throw new Error('Not implemented: symbol');
    },
    function: (array, indexRef) => {
        throw new Error('Not implemented: function');
    },
    array: (array, indexRef) => {
        const length = getLength(array, indexRef);
        const endIndex = indexRef.index + length;

        const output = [];

        while(indexRef.index < endIndex) {
            output.push(convertType(array, indexRef))
        }

        return output;
    },
    object: (array, indexRef) => {
        //TODO
    },
    //TODO maps? sets? typed arrays?
}


function getLength(array, indexRef) {
    const index = indexRef.index;

    indexRef.index += 4;

    return (array[index] << 24) + (array[index+1] << 16) + (array[index+2] << 8) + array[index+3];
}