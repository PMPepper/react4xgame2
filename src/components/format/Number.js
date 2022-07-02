//TODO default to current selected lang code
import PropTypes from 'prop-types';

//Helpers
import formatNumber from 'helpers/string/format-number';

//Consts
const compactOptions = Object.freeze({notation: 'compact'});


//this component is Pure
export default function Number({children, langCode = null, decimalPlaces = null, compact = false}) {
  return formatNumber(children, decimalPlaces, langCode, compact ? compactOptions : undefined );
}

if(process.env.NODE_ENV !== 'production') {
    Number.propTypes = {
    value: PropTypes.instanceOf(Date),
    langCode: PropTypes.string,
    decimalPlaces: PropTypes.number
  };
}
