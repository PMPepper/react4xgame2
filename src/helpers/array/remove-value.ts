export default function removeValue<T = any>(array: T[], value: T) {
    const index = array.indexOf(value);

    if(index !== -1) {
        array.splice(index, 1);

        return true;
    }

    return false;
}