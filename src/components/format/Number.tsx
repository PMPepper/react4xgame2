//TODO default to current selected lang code

//Helpers
import formatNumber from 'helpers/string/format-number';
import { Trans } from '@lingui/macro';
import React from 'react';

//Consts
const compactOptions = Object.freeze({notation: 'compact'});

type NumberProps = {
  children?: number;
  langCode?: string | string[],
  decimalPlaces?: number;
  compact?: boolean;
};


//this component is Pure
export default function Number({children, langCode, decimalPlaces = null, compact = false}: NumberProps) {
  return children === null ?
    <Trans id="Number.na">-</Trans>
    :
    formatNumber(children, decimalPlaces, langCode, compact ? compactOptions : undefined );
}
