import sortOnPropNumeric from './sort-on-prop-numeric';

export default function sortArrayOnPropertyNumeric(arr, prop, desc = false) {

  arr.sort(sortOnPropNumeric(prop, desc));

  return arr;
}
