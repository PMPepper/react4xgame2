

export default function sortOnProp<T extends {}, K extends keyof T>(sortFunc: (a: T[K], b: T[K]) => number, prop: K) {
    return (a, b) => sortFunc(a[prop], b[prop])
}
