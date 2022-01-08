//if max digits = 2 then 123 = 123, 12.3 = 12 and 1.23 = 1.2
import roundTo from './round-to';

export default function roundToDigits(n, minDigits) {
  const pow = Math.floor(Math.log10(n))+1

  return roundTo(n, minDigits - pow);
}
