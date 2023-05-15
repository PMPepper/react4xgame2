//TODO replace this with TS types

const enumCheck = Symbol('enumCheck')


export default class Enum {
    constructor(enumCheckArg, name) {
        if(enumCheckArg !== enumCheck) {
            throw new Error('Enums must be created using the Enum.create method');
        }

        this.name = name;

        Object.freeze(this);
    }

    toString() {
        return `Enum::${this.constructor.name}::${this.name}`
    }



    static create(name, values) {
        let C = class extends Enum {}

        //Create a new class and add name
        Object.defineProperty (C, 'name', {value: name});

        //add values
        values.forEach(value => {
            C[value] = new C(enumCheck, value);
        });

        return C;
    }
}