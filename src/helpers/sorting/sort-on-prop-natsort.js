
import getNatsortCompare from './get-natsort-compare';

export default function sortOnPropNatsort(prop, desc = false, locale = undefined, collatorOptions = undefined) {
    const compare = getNatsortCompare(locale, collatorOptions);

    return desc ?
        (a, b) => {
            return compare(b[prop], a[prop]);
        }
        :
        (a, b) => {
            return compare(a[prop], b[prop]);
        }
}