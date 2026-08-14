import PropTypes from 'prop-types';

import FormatDate from 'components/format/FormatDate';


export default function Time({value, langCode = null, format = null, getRef = null, ...rest}) {
  if(!value) {
    return null;
  }
  
  return <time
      {...rest}
      ref={getRef}
      dateTime={value.toISOString()}
    >
      <FormatDate value={value} langCode={langCode} format={format} />
    </time>
}

Time.propTypes = {
  value: PropTypes.instanceOf(Date),
};
