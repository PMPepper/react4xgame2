//Output a random number with a normal distribution, based on the Box-Mueller transform
//https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
//First argument is random number generator, defaults to Math.random
//returns a number between 0 and 1
export default function randomNormal(rand = Math.random) {
    let u = 0, v = 0;
    while(u === 0) u = rand(); //Converting [0,1) to (0,1)
    while(v === 0) v = rand();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randomNormal(rand) // resample between 0 and 1
    return num
  }