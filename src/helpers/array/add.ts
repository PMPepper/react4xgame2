//Adds array(s) to the end of another, in place
export default function add<T = any>(arr: T[], ...arrs:T[][]) {
  arrs.forEach(addArr => {
    addArr.forEach(value => {
      arr.push(value);
    })
  })

  return arr;//just to make code easier (method chaining, etc)
}
