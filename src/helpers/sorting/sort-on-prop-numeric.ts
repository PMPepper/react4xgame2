import { KeysOfValue } from "types/utils";


export default function sortOnPropNumeric<T extends {}, K extends KeysOfValue<T, number> = KeysOfValue<T, number>>(prop: K, desc: boolean = false): (a: T, b: T) => number {
    return desc ?
        (a, b) => {
            return (b[prop] as number) - (a[prop] as number);
        }
        :
        (a, b) => {
            return (a[prop] as number) - (b[prop] as number);
        }
}
