import roundTo from 'helpers/math/round-to';


export default function formatNumber(n, decimalPlaces = null, culture = null, options = null) {
  if(decimalPlaces) {
    if(!Number.isInteger(+decimalPlaces)) {
      throw new Error('formatNumber:: decimalPlaces must be an integer, was :'+decimalPlaces);
    }

    n = roundTo(n, decimalPlaces);
  }

  if(culture || options) {
    if(!(culture instanceof Intl.NumberFormat)) {
      culture = new Intl.NumberFormat(culture || undefined, options || undefined);
    }
  } else {
    culture = defaultNumberformat;
  }

  return culture.format(n);
}


const defaultNumberformat = Intl.NumberFormat();
