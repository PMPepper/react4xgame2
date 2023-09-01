//TODO default to current selected lang code

//Helpers
import formatNumber from 'helpers/string/format-number';
import { Trans } from '@lingui/macro';
import React, { ReactElement } from 'react';

//Consts
const compactOptions = Object.freeze({notation: 'compact'});

type NumberProps = {
  children?: number;
  langCode?: string | string[],
  decimalPlaces?: number;
  compact?: boolean;
};


//this component is Pure
export default function Number({children, langCode, decimalPlaces = null, compact = false}: NumberProps): React.ReactElement {
  return children === null ?
    <Trans id="Number.na">-</Trans> as ReactElement
    :
    formatNumber(children, decimalPlaces, langCode, compact ? compactOptions : undefined ) as any as ReactElement;
}
