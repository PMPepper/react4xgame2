
import { KeysOfValue } from 'types/utils';
import getNatsortCompare from './get-natsort-compare';

export default function sortOnPropNatsort<T extends {}, K extends KeysOfValue<T, string> = KeysOfValue<T, string>>(prop: K, desc: boolean = false, locale: string | string[] = undefined, collatorOptions: Intl.CollatorOptions = undefined) {
    const compare = getNatsortCompare(locale, collatorOptions);

    return desc ?
        (a: T, b: T) => {
            return compare(b[prop] as string, a[prop] as string);
        }
        :
        (a: T, b: T) => {
            return compare(a[prop] as string, b[prop] as string);
        }
}