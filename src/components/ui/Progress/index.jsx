import React from 'react';
import PropTypes from 'prop-types';
import {t, Trans} from '@lingui/macro';

import defaultStyles from './Progress.module.scss';

//Components
import FormatNumber from 'components/format/Number';

//Hooks

//helpers
import combineProps from 'helpers/react/combine-props';
import classnames from 'helpers/css/class-list-to-string';
import formatNumber from 'helpers/string/format-number';


//The component
const Progress = React.forwardRef(function Progress({styles, value, max, showValues, formatValuesDecimalPlaces, full, thin, ...rest}, ref) {
  
  const extendedClasses = classnames(full && styles.full, thin && styles.thin);
  if(isNaN(value)) {
    value = 0;
  }

  const formattedValue = formatNumber(value, formatValuesDecimalPlaces /*, i18n.language*/);
  const formattedMax = formatNumber(max, formatValuesDecimalPlaces/*, i18n.language*/);
  const percent = (value / max) * 100
  const formattedPercent = <FormatNumber children={percent} decimalPlaces={2} />

  const progressProps = {
    value,
    max,
    className: classnames(styles.progress, showValues && styles.showValues, extendedClasses),
    "data-progress-values":  showValues ?
        t`${formattedValue} / ${formattedMax}`
        :
        undefined,
    style: {
        "--progress-value": `${percent}%`
    }
  };

  return <progress {...combineProps(progressProps, rest)} ref={ref}>
    <div className={classnames(styles.gauge, extendedClasses)}>
      <span
        className={classnames(styles.bar, extendedClasses)}
      >
        {showValues ?
          <Trans id="progress.fallback.valuesFormat">{formattedValue} / {formattedMax} ({formattedPercent}%)</Trans>
          :
          <Trans id="progress.fallback.format">{formattedPercent}%</Trans>
        }

      </span>
    </div>
  </progress>
});

export default Progress;


Progress.defaultProps = {
  value: 0,
  max: 100,
  full: false,
  styles: defaultStyles,
  formatValuesDecimalPlaces: 0
};

Progress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  full: PropTypes.bool,
};
