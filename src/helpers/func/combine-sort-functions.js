export default function combineSortFunctions() {
  const args = arguments;

  return (a, b) => {
    let sortFunc = null;
    let result = null;

    for(let i = 0; i < args.length; i++) {
      sortFunc = args[i];

      if(sortFunc) {
        result = sortFunc(a, b);

        if(result !== 0) {
          return result;
        }
      }
    }

    return 0;
  }
}
