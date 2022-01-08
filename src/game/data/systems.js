import solAsteroids from './solAsteroids.json';

//const solAsteroids = [];

/*
example random asteroid belt:
{
  "type": "asteroidBelt",
  "parent": "Sol A",
  "nameProps": {
    "prefix": "sol"
  },
  "factionNameProps": {
    "martian": {
      "prefix": "ass"
    },
    "human": {
      "system": "sol"
    }
  },
  "minOrbitRadius": 329115316200,
  "maxOrbitRadius": 478713187200,
  "minNumber": 100,
  "maxNumber": 120,
  "minRadius": 100000,
  "maxRadius": 475000,
  "cTypeWeight": 75,
  "sTypeWeight": 17,
  "mTypeWeight": 8
},
*/

const systems = {
  Sol: {
    "name":"Sol",
    "bodies":[
      {
        "name":"Sol A",
        "type": "star",
        "mass": 1.9891e30,
        "radius": 695700000,
        "day": 2160000,
        "axialTilt": 0.1309,
        "tidalLock": false,
        "luminosity": 3.846e26
      },
      {
        "name": "Mercury",
        "type": "planet",
        "parent": "Sol A",
        "mass": 3.285e23,
        "radius": 2440000,
        "day": 5067000,
        "axialTilt": 0.03682645,
        "tidalLock": true,
        "albedo": 0.068,
        "orbit": {
          "type": "regular",
          "radius": 57909050000,
          "offset": 0.15
        }
      },
      {
        "name": "Venus",
        "type": "planet",
        "parent": "Sol A",
        "mass": 4.8675e24,
        "radius": 6051000,
        "day": 10097200,
        "axialTilt": 3.0944688,
        "tidalLock": false,
        "albedo": 0.77,
        "orbit": {
          "type": "regular",
          "radius": 108208000000,
          "offset": 0.52
        }
      },
      {
        "name": "Earth",
        "type": "planet",
        "parent": "Sol A",
        "mass": 5.972e24,
        "radius": 6371000,
        "day": 86400,
        "axialTilt": 0.408407,
        "tidalLock": false,
        "albedo": 0.29,
        "orbit": {
          "type": "regular",
          "radius": 149600000000,
          "offset": 0
        }
      },
      {
        "name": "Luna",
        "type": "moon",
        "parent": "Earth",
        "mass": 7.34767309e22,
        "radius": 1737000,
        "day": 2548800,
        "axialTilt": 0.0269199584,
        "tidalLock": true,
        "albedo": 0.12,
        "orbit": {
          "type": "regular",
          "radius": 384399000,
          "offset": 0
        }
      },
      {
        "name": "Mars",
        "type": "planet",
        "parent": "Sol A",
        "mass": 6.4171e23,
        "radius": 3389000,
        "day": 88800,
        "axialTilt": 0.436332,
        "tidalLock": false,
        "albedo": 0.25,
        "orbit": {
          "type": "regular",
          "radius": 227939200000,
          "offset": 0.23
        }
      },
      {
        "name": "Phobos",
        "type": "moon",
        "parent": "Mars",
        "mass": 1.0659e16,
        "radius": 11267,
        "day": 88646.4,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.071,
        "orbit": {
          "type": "regular",
          "radius": 9376000,
          "offset": 0
        }
      },
      {
        "name": "Deimos",
        "type": "moon",
        "parent": "Mars",
        "mass": 1.4762e15,
        "radius": 6200,
        "day": 88646.4,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.068,
        "orbit": {
          "type": "regular",
          "radius": 23463200,
          "offset": 0
        }
      },
      ...solAsteroids,
      {
        "name": "Jupiter",
        "type": "gasGiant",
        "parent": "Sol A",
        "mass": 1.8986e27,
        "radius": 71492000,
        "day": 35760,
        "axialTilt": 0.05462881,
        "tidalLock": false,
        "albedo": 0.343,
        "orbit": {
          "type": "regular",
          "radius": 778299000000,
          "offset": 0.74
        }
      },
      {
        "name": "Metis",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 3.6e16,
        "radius": 21500,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.061,
        "orbit": {
          "type": "regular",
          "radius": 128852000,
          "offset": 0.34
        }
      },

      {
        "name": "Adrastea",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 0.2e16,
        "radius": 8200,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.1,
        "orbit": {
          "type": "regular",
          "radius": 129000000,
          "offset": 0.81
        }
      },

      {
        "name": "Amalthea",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 208e16,
        "radius": 83500,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.09,
        "orbit": {
          "type": "regular",
          "radius": 181366000,
          "offset": 0.5
        }
      },

      {
        "name": "Thebe",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 43e16,
        "radius": 49300,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.047,
        "orbit": {
          "type": "regular",
          "radius": 222452000,
          "offset": 0.03
        }
      },

      {
        "name": "Io",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 8.931938e22,
        "radius": 1821600,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.63,
        "orbit": {
          "type": "regular",
          "radius": 421700000,
          "offset": 0.61
        }
      },
      {
        "name": "Europa",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 4.799844e22,
        "radius": 1560800,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.67,
        "orbit": {
          "type": "regular",
          "radius": 670900000,
          "offset": 0.78
        }
      },
      {
        "name": "Ganymede",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 1.4819e23,
        "radius": 2634100,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.43,
        "orbit": {
          "type": "regular",
          "radius": 1070400000,
          "offset": 0.64
        }
      },
      {
        "name": "Callisto",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 1.075938e23,
        "radius": 2410300,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.22,
        "orbit": {
          "type": "regular",
          "radius": 1882700000,
          "offset": 0.22
        }
      },
      {
        "name": "Themisto",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 6.89e14,
        "radius": 4000,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.04,
        "orbit": {
          "type": "regular",
          "radius": 7391650000,
          "offset": 0.41
        }
      },
      {
        "name": "Leda",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 1.1e16,
        "radius": 10000,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.04,
        "orbit": {
          "type": "regular",
          "radius": 11160000000,
          "offset": 0.79
        }
      },
      {
        "name": "Himalia",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 4.2e18,
        "radius": 75000,
        "day": 28015.2,
        "axialTilt": 0,
        "tidalLock": false,
        "albedo": 0.04,
        "orbit": {
          "type": "regular",
          "radius": 11460000000,
          "offset": 0.27
        }
      },
      {
        "name": "Lysithea",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 6.3e16,
        "radius": 18000,
        "day": null,
        "axialTilt": 0,
        "tidalLock": true,
        "albedo": 0.04,
        "orbit": {
          "type": "regular",
          "radius": 11720000000,
          "offset": 0.58
        }
      },
      {
        "name": "Elara",
        "type": "moon",
        "parent": "Jupiter",
        "mass": 8.7e17,
        "radius": 43000,
        "day": 43200,
        "axialTilt": 0,
        "tidalLock": false,
        "albedo": 0.04,
        "orbit": {
          "type": "regular",
          "radius": 11740000000,
          "offset": 0.58
        }
      },
      {
        "name": "Saturn",
        "type": "gasGiant",
        "parent": "Sol A",
        "mass": 5.6836e26,
        "radius": 58232000,
        "day": 38520,
        "axialTilt": 0.4660029,
        "tidalLock": false,
        "albedo": 	0.342,
        "orbit": {
          "type": "regular",
          "radius": 1429000000000,
          "offset": 0.15
        }
      },
      {
        "name": "Uranus",
        "type": "gasGiant",
        "parent": "Sol A",
        "mass": 8.6810e25,
        "radius": 25362000,
        "day": 62040,
        "axialTilt": 1.71042,
        "tidalLock": false,
        "albedo": 0.3,
        "orbit": {
          "type": "regular",
          "radius": 2875040000000,
          "offset": 0.77
        }
      },
      {
        "name": "Neptune",
        "type": "gasGiant",
        "parent": "Sol A",
        "mass": 1.0243e26,
        "radius": 24622000,
        "day": 57960,
        "axialTilt": 0.49427724,
        "tidalLock": false,
        "albedo": 0.290,
        "orbit": {
          "type": "regular",
          "radius": 4504450000000,
          "offset": 0.8
        }
      },
      {
        "name": "Pluto",
        "type": "dwarfPlanet",
        "parent": "Sol A",
        "mass": 1.303e22,
        "radius": 1188300,
        "day": 551836,
        "axialTilt": 2.13855193,
        "tidalLock": false,
        "albedo": 0.49,
        "orbit": {
          "type": "regular",
          "radius": 5906380000000,
          "offset": 0.153
        }
      },
      {
        "name": "Haumea",
        "type": "dwarfPlanet",
        "parent": "Sol A",
        "mass": 4.006e21,
        "radius": 816000,
        "day": 14083,
        "axialTilt": 0,
        "tidalLock": false,
        "albedo": 0.804,//geometric?
        "orbit": {
          "type": "regular",
          "radius": 6.465e12,
          "offset": 0.5
        }
      },
      {
        "name": "Makemake",
        "type": "dwarfPlanet",
        "parent": "Sol A",
        "mass": 4.4e21,
        "radius": 715000,
        "day": 27975.6,
        "axialTilt": 0,
        "tidalLock": false,
        "albedo": 0.81,//geometric?
        "orbit": {
          "type": "regular",
          "radius": 6.8389e12,
          "offset": 0.69
        }
      },
      {
        "name": "Eris",
        "type": "dwarfPlanet",
        "parent": "Sol A",
        "mass": 1.66e22,
        "radius": 1163000,
        "day": 93240,
        "axialTilt": 0,
        "tidalLock": false,
        "albedo": 0.96,//geometric?
        "orbit": {
          "type": "regular",
          "radius": 10.166e12,
          "offset": 0.83
        }
      }
    ]
  }
};

//TEMP CODE - create copy of Sol called Sol2 without venus (so I can tell the difference!)
systems.Sol2 = JSON.parse(JSON.stringify(systems.Sol));
systems.Sol2.bodies.splice(2, 1);

systems.Sol3 = JSON.parse(JSON.stringify(systems.Sol));
systems.Sol3.bodies.splice(1, 1);

systems.Sol4 = JSON.parse(JSON.stringify(systems.Sol));
systems.Sol4.bodies.splice(1, 2);
//END TEMP CODE

export default systems;
