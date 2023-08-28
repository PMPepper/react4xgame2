import roundTo from 'helpers/math/round-to';

export default function formatNumber(n: number, decimalPlaces?: number, culture?: Intl.NumberFormat): string;
export default function formatNumber(n: number, decimalPlaces?: number, culture?: string | string[], options?: Intl.NumberFormatOptions): string;

export default function formatNumber(n: number, decimalPlaces?: number, culture?: string | string[] | Intl.NumberFormat, options?: Intl.NumberFormatOptions) {
  if(decimalPlaces !== null && decimalPlaces !== undefined) {
    if(!Number.isInteger(+decimalPlaces)) {
      throw new Error('formatNumber:: decimalPlaces must be an integer, was :'+decimalPlaces);
    }

    if(options?.notation === 'compact') {
      options = {
        ...options,
        maximumFractionDigits: decimalPlaces
      }
    } else {
      n = roundTo(n, decimalPlaces);
    }
  }

  let numberFormat = defaultNumberformat;

  if(culture || options) {
    if(!(culture instanceof Intl.NumberFormat)) {
      numberFormat = new Intl.NumberFormat(culture, options);
    } else {
      numberFormat = culture;
    }
  }

  return numberFormat.format(n);
}


const defaultNumberformat = Intl.NumberFormat();
