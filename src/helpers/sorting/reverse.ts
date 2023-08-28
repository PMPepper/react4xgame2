



export default function reverse<T>(sortFunc: (a: T, b: T) => number) {
    return (a: T, b: T) => sortFunc(b, a);
}