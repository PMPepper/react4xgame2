export default function removeValue(array, value) {
    const index = array.indexOf(value);

    if(index !== -1) {
        array.splice(index, 1);

        return true;
    }

    return false;
}