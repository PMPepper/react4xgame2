

export default function sortOnPropNumeric(prop, desc = false) {
    return desc ?
        (a, b) => {
            return b[prop] - a[prop];
        }
        :
        (a, b) => {
            return a[prop] - b[prop];
        }
}
  