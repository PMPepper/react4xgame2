export default function mean(...values) {
    return values.reduce((sum, value) => {return sum + value}, 0) / values.length;
}