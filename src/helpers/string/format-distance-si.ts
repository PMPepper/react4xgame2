import roundToDigits from 'helpers/math/round-to-digits';
import formatNumber from 'helpers/string/format-number';

const magnitudes = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'] as const;


export default function formatDistanceSI(distance: number, baseMag?: number, minDigits?: number, culture?: Intl.NumberFormat): string;
export default function formatDistanceSI(distance: number, baseMag?: number, minDigits?: number, culture?: string | string[], options?: Intl.NumberFormatOptions): string

export default function formatDistanceSI(distance: number, baseMag: number = 0, minDigits: number = 0, culture?: string | string[] | Intl.NumberFormat, options?: Intl.NumberFormatOptions) {
  distance /= Math.pow(10, baseMag*3)

  const pow = Math.floor(Math.log10(distance));
  const mag = Math.floor(pow / 3);

  let magDist = distance / Math.pow(10, mag*3);

  return formatNumber(roundToDigits(magDist, minDigits), culture as any, options as any) + ' ' + magnitudes[mag] + (baseMag > 0 ? ' ' : '') + magnitudes[baseMag] + 'm';
}
