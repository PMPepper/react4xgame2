export default function intersection<T = any>(a: T[], b: T[]): T[] {
  var setB = new Set(b);
  return [...new Set(a)].filter(x => setB.has(x));
}
