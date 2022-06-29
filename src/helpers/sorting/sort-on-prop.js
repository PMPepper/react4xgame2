

export default function sortOnProp(sortFunc, prop) {
    return (a, b) => sortFunc(a[prop], b[prop])
}