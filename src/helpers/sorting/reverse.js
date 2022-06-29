



export default function reverse(sortFunc) {
    return (a, b) => sortFunc(b, a);
}