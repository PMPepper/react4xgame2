import tnos from '../raw-tno-data.json';

import SimplePRNG from 'classes/SimplePRNG';

import volumeOfSphere from 'helpers/geometry/volume-of-sphere';
import randomNormal from 'helpers/math/random-normal';

//Example source
// {
//     "Name": "(523753) 2014 WV508",
//     "Diameter": 57,
//     "a": 53.5
//  },

//Example output
// {
//     "name": "Thisbe",
//     "parent": "Sol A",
//     "type": "asteroid",
//     "mass": 1,
//     "radius": 116000,
//     "diameter": 232000,
//     "day": 21751,
//     "axialTilt": 0.09099230442724522,
//     "tidalLock": false,
//     "albedo": 0.0671,
//     "orbit": {
//       "type": "regular",
//       "radius": 414146953281.6163,
//       "offset": 0.08343193032898144
//     }
//   },

const bodyType = 'asteroid';
const auToMeters = 1.496e+11

const prng = new SimplePRNG(235635298);

//C, S, and M class asteroids as 1.38, 2.71, and 5.32 g/cm3.

// The C-type (chondrite) asteroids are most common. They probably consist of clay and silicate rocks, and are dark in appearance. ...
// The S-types ("stony") are made up of silicate materials and nickel-iron.
// The M-types are metallic (nickel-iron).

const icyProb = 0.8;
const icyDensity = [0.35, 1.5];
const rockyDensity = [2, 4]



const output = tnos.map(
    ({Name: name, Diameter: diameter, a: orbitRadiusAU}) => {
        const r = diameter * 500;

        //caluclate mass based on radius + a lot of random
        const sphereVol = volumeOfSphere(r);
        const actualVol = (0.1 + (randomNormal(prng.next) * 0.9)) * sphereVol;
        const densityRange = prng.next() >= icyProb ? rockyDensity : icyDensity;
        const density = densityRange[0] + (randomNormal(prng.next) * (densityRange[1] - densityRange[0])) * 1000;//convert from g/cm3 to kg/m3

        return {
            name,
            parent: "Sol A",
            type: bodyType,
            mass: actualVol * density,
            radius: r,
            diameter: diameter * 1000,
            day: Math.round(prng.next() * 100000),//essentially guess?
            axialTilt: (prng.next()**2) * 1.5,//essentially guess?
            tidalLock: false,
            albedo: 0.1 + (0.9 * (prng.next()**2)), //essentially guess?
            orbit: {
                type: "regular",
                radius: orbitRadiusAU * auToMeters,
                offset: prng.next(),//random
            }
        }
    }
)

export default output;