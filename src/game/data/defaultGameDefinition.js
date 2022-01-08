//includes stuff that usually won't change between games (minerals, tech tree, structure build times, costs, minerals, etc)

export default {
  baseSpecies: {
    growthRate: 1.05,
    production: 1,
    research: 1,
    mining: 1,
    support: 0.2,//base fraction of how many individuals are needed for support jobs in a colony (e.g. agriculture, bureaucracy etc)
    workerMultiplier: 1,//how many individuals are needed to operate something, e.g. if a factory needs a base of 1000 workers, and this value is 2, then you'll need 500 workers to operate the factory
    crewMultiplier: 1,//As above, but for crewing ships
  },
  minerals: {
    "1": "Thatcherite",//coru
    "2": "Blairite",//vend
    "3": "Brownite",//trit
    "4": "Corbynite",//dura
    "5": "Adamantium",//neu
    "6": "Mayite",//corbo
    "7": "Chobium",//galli
    "8": "Sloughium",//boro
    "9": "Muskite",//merc
    "10": "Majorium",
    "11": "Cameronium",//uri
    "12": "Stellarium",//sori
  },
  startingWorldMinerals: {
    "1": {quantity: [400000, 500000], access: [0.7, 1]},
    "2": {quantity: [50000, 100000], access: [0.5, 1]},
    "3": {quantity: [50000, 100000], access: [0.5, 1]},
    "4": {quantity: [50000, 100000], access: [0.5, 1]},
    "5": {quantity: [50000, 100000], access: [0.8, 1]},
    "6": {quantity: [50000, 100000], access: [0.5, 1]},
    "7": {quantity: [50000, 100000], access: [0.5, 1]},
    "8": {quantity: [50000, 100000], access: [0.5, 1]},
    "9": {quantity: [50000, 100000], access: [0.5, 1]},
    "10": {quantity: [50000, 100000], access: [0.5, 1]},
    "11": {quantity: [50000, 100000], access: [0.5, 1]},
    "12": {quantity: [200000, 250000], access: [0.5, 1]},
  },
  systemBodyTypeMineralAbundance: {
    "planet": {
      "1": 1,//coru
      "2": 1,//vend
      "3": 1,//trit
      "4": 1,//dura
      "5": 1,//neu
      "6": 1,//corbo
      "7": 1,//galli
      "8": 1,//boro
      "9": 1,//merc
      "10": 1,
      "11": 1,//uri
      "12": 1,//sori
    },
    "moon": {
      "1": 1,//coru
      "2": 1,//vend
      "3": 1,//trit
      "4": 1,//dura
      "5": 1,//neu
      "6": 1,//corbo
      "7": 1,//galli
      "8": 1,//boro
      "9": 1,//merc
      "10": 1,
      "11": 1,//uri
      "12": 1,//sori
    },
    "dwarfPlanet": {
      "1": 1,//coru
      "2": 1,//vend
      "3": 1,//trit
      "4": 1,//dura
      "5": 1,//neu
      "6": 1,//corbo
      "7": 1,//galli
      "8": 1,//boro
      "9": 1,//merc
      "10": 1,
      "11": 1,//uri
      "12": 1,//sori
    },
    "asteroid": {
      "1": 1,//coru
      "2": 1,//vend
      "3": 1,//trit
      "4": 1,//dura
      "5": 1,//neu
      "6": 1,//corbo
      "7": 1,//galli
      "8": 1,//boro
      "9": 1,//merc
      "10": 1,
      "11": 1,//uri
      "12": 0.2,//sori
    },
    "gasGiant": {
      "1": 0,//coru
      "2": 0,//vend
      "3": 0,//trit
      "4": 0,//dura
      "5": 0,//neu
      "6": 0,//corbo
      "7": 0,//galli
      "8": 0,//boro
      "9": 0,//merc
      "10": 0,
      "11": 0,//uri
      "12": 1,//sori
    },
  },
  structures: {
    "1": {
      name: 'Conventional industry',
      mass: 25e6,
      workers: 50000,
      bp: 100,
      minerals: {},
      capabilities: {
        construction: 1
      },
      upgrade: [3],
      requireTechnologyIds: [],
    },
    "2": {
      name: 'Conventional mine',
      mass: 25e6,
      workers: 50000,
      bp: 100,
      minerals: {},
      capabilities: {
        mining: 1
      },
      upgrade: [4],
      requireTechnologyIds: [],
    },
    "3": {
      name: 'PE Industry',
      mass: 25e6,
      workers: 50000,
      bp: 120,
      minerals: {
        "4": 60,
        "3": 30,
        "2": 30,
      },
      capabilities: {
        construction: 10
      },
      requireTechnologyIds: ['pe'],
    },
    "4": {
      name: 'PE mine',
      mass: 25e6,
      workers: 50000,
      bp: 120,
      minerals: {
        "4": 60,
        "1": 30,
      },
      capabilities: {
        mining: 10
      },
      requireTechnologyIds: ['pe'],
    },
    "5": {
      name: 'Conventional research facility',
      mass: 5e8,
      workers: 1000000,
      bp: 2000,
      minerals: {},
      capabilities: {
        research: 10
      },
      upgrade: [6],
      requireTechnologyIds: [],
    },
    "6": {
      name: 'PE research facility',
      mass: 5e8,
      workers: 1000000,
      bp: 2400,
      minerals: {
        "4": 1200,
        "9": 1200,
      },
      capabilities: {
        research: 100
      },
      requireTechnologyIds: ['pe'],
    },
  },
  researchAreas: {
    "1": "Biology",
    "2": "Industrial",
    "3": "Defensive systems",
    "4": "Energy weapons",
    "5": "Logistics",
    "6": "Ground combat",
    "7": "Missiles and kinetic weapons",
    "8": "Power and propulsion",
    "9": "Sensors and fire control",
  },
  research: {
    "m1": {
      name: "Mining rate 1",
      description: "Increase mining production by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: [],
      unlockTechnologyIds: ['m1']
    },
    "m2": {
      name: "Mining rate 2",
      description: "Increase mining production by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['m1'],
      unlockTechnologyIds: ['m2']
    },
    "m3": {
      name: "Mining rate 3",
      description: "Increase mining production by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['m2'],
      unlockTechnologyIds: ['m3']
    },
    "m4": {
      name: "Mining rate 4",
      description: "Increase mining production by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['m3'],
      unlockTechnologyIds: ['m4']
    },
    "m5": {
      name: "Mining rate 5",
      description: "Increase mining production by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['m4'],
      unlockTechnologyIds: ['m5']
    },
    "c1": {
      name: "Construction rate 1",
      description: "Increase construction rate by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: [],
      unlockTechnologyIds: ['c1']
    },
    "c2": {
      name: "Construction rate 2",
      description: "Increase construction rate by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['c1'],
      unlockTechnologyIds: ['c2']
    },
    "c3": {
      name: "Construction rate 3",
      description: "Increase construction rate by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['c2'],
      unlockTechnologyIds: ['c3']
    },
    "c4": {
      name: "Construction rate 4",
      description: "Increase construction rate by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['c3'],
      unlockTechnologyIds: ['c4']
    },
    "c5": {
      name: "Construction rate 5",
      description: "Increase construction rate by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['c4'],
      unlockTechnologyIds: ['c5']
    },
    "r1": {
      name: "Research rate 1",
      description: "Increase research speed by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: [],
      unlockTechnologyIds: ['r1']
    },
    "r2": {
      name: "Research rate 2",
      description: "Increase research speed by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['r1'],
      unlockTechnologyIds: ['r2']
    },
    "r3": {
      name: "Research rate 3",
      description: "Increase research speed by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['r2'],
      unlockTechnologyIds: ['r3']
    },
    "r4": {
      name: "Research rate 4",
      description: "Increase research speed by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['r3'],
      unlockTechnologyIds: ['r4']
    },
    "r5": {
      name: "Research rate 5",
      description: "Increase research speed by 20%",
      cost: 100,
      area: 2,
      requireResearchIds: ['r4'],
      unlockTechnologyIds: ['r5']
    },
    "pe": {
      name: 'Post-Einstein technology',
      description: "Unlock the potential of Post-Einsteinium (PE) physics to create technology vastly superior to anything previously thought possible.",
      cost: 5000,
      area: 2,
      requireResearchIds: [],
      unlockTechnologyIds: ['pe']
    },
    "test1": {
      name: 'Test 1',
      description: "A test technology.",
      cost: 5000,
      area: 2,
      requireResearchIds: [],
      unlockTechnologyIds: []
    },
    "test2": {
      name: 'Test 2',
      description: "Another test technology.",
      cost: 5000,
      area: 2,
      requireResearchIds: [],
      unlockTechnologyIds: []
    },
    "e1": {
      name: "PE Drive",
      description: "Utilise PE physics to create a fundamentally new form of propulsion and gain access to the far reaches of our solar system",
      cost: 500,
      area: 8,
      requireResearchIds: ['pe'],
      unlockTechnologyIds: ['e1', 'fe1']
    }
  },
  technology: {
    "pe": {
      name: 'Post-Einstein technology'
    },
    "e1": {
      name: 'PE Drive'
    },
    "fe1": {
      name: 'Fuel efficiency 1'
    },

    "m1": {
      name: "Mining rate 1",
      modifyCapabilities: {
        mining: 0.2,
      },
    },
    "m2": {
      name: "Mining rate 2",
      modifyCapabilities: {
        mining: 0.2,
      },
    },
    "m3": {
      name: "Mining rate 3",
      modifyCapabilities: {
        mining: 0.2,
      },
    },
    "m4": {
      name: "Mining rate 4",
      modifyCapabilities: {
        mining: 0.2,
      },
    },
    "m5": {
      name: "Mining rate 5",
      modifyCapabilities: {
        mining: 0.2,
      },
    },
    "c1": {
      name: "Construction rate 1",
      modifyCapabilities: {
        construction: 0.2,
      },
    },
    "c2": {
      name: "Construction rate 2",
      modifyCapabilities: {
        construction: 0.2,
      },
    },
    "c3": {
      name: "Construction rate 3",
      modifyCapabilities: {
        construction: 0.2,
      },
    },
    "c4": {
      name: "Construction rate 4",
      modifyCapabilities: {
        construction: 0.2,
      },
    },
    "c5": {
      name: "Construction rate 5",
      modifyCapabilities: {
        construction: 0.2,
      },
    },
    "r1": {
      name: "Research rate 1",
      modifyCapabilities: {
        research: 0.2,
      },
    },
    "r2": {
      name: "Research rate 2",
      modifyCapabilities: {
        research: 0.2,
      },
    },
    "r3": {
      name: "Research rate 3",
      modifyCapabilities: {
        research: 0.2,
      },
    },
    "r4": {
      name: "Research rate 4",
      modifyCapabilities: {
        research: 0.2,
      },
    },
    "r5": {
      name: "Research rate 5",
      modifyCapabilities: {
        research: 0.2,
      },
    },
  }
};
