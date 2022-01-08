import roundToDigits from 'helpers/math/round-to-digits';
import formatNumber from 'helpers/string/format-number';

const magnitudes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];


export default function formatDistanceSI(distance, baseMag = 0, minDigits = 0, culture = null, options = null) {
  distance /= Math.pow(10, baseMag*3)

  const pow = Math.floor(Math.log10(distance));
  const mag = Math.floor(pow / 3);

  let magDist = distance / Math.pow(10, mag*3);

  return formatNumber(roundToDigits(magDist, minDigits), culture, options) + ' ' + magnitudes[mag] + (baseMag > 0 ? ' ' : '') + magnitudes[baseMag] + 'm';
}
