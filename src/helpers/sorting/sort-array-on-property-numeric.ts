import { KeysOfValue } from 'types/utils';
import sortOnPropNumeric from './sort-on-prop-numeric';

export default function sortArrayOnPropertyNumeric<T extends {}, K extends KeysOfValue<T, number> = KeysOfValue<T, number>>(arr: T[], prop: K, desc: boolean = false) {

  arr.sort(sortOnPropNumeric(prop, desc));

  return arr;
}
