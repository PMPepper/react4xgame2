

export default function sortArrayOnPropertyNumeric(arr, prop, desc = false) {

  arr.sort(desc ?
    (a, b) => {
      return b[prop] - a[prop];
    }
    :
    (a, b) => {
      return a[prop] - b[prop];
    }
  );

  return arr;
}
