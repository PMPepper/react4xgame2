// import forEach from '@/helpers/object/forEach';
//
// export default function getColonyStructuresCapabilities(colony, gameConfig) {
//   //structures
//   const structuresWithCapability = {};//List of all structures with this capability
//   const totalStructureCapabilities = {};//quantity for each capability/structure
//
//   //for each type of structure in the colony...
//   forEach(colony.colony.structures, (quantity, structureId) => {
//     const structureDefinition = gameConfig.structures[structureId];
//
//     if(!structureDefinition) {
//       throw new Error(`Unknown structure: '${structureId}'`);
//     }
//
//     //for every type of thing (capability) this structure can do (e.g. mining, reseach, etc)...
//     forEach(structureDefinition.capabilities, (value, capability) => {
//       if(!(capability in totalStructureCapabilities)) {
//         totalStructureCapabilities[capability] = 0;
//         structuresWithCapability[capability] = {};
//       }
//
//       //record the total for the colony of this action (e.g. total amount of mining we can perform, etc)...
//       totalStructureCapabilities[capability] += value * quantity;
//
//       //...AND record the quantities of structures that can perform this action (e.g. mining can be performed by 3 basic mines, 14 PE mines)
//       structuresWithCapability[capability][structureId] = quantity;
//     });
//   })
//
//   return {
//     totalRawStuctureCapabilities: totalStructureCapabilities,
//     totalStructureCapabilities,//TODO modify by species, conditions, etc - e.g. this is net value
//     structuresWithCapability
//   }
// }
