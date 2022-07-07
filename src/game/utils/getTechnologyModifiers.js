import forEach from 'helpers/object/forEach';

export default function getTechnologyModifiers(factionTechnologies) {
  const modifiers = {};

  forEach(factionTechnologies, technology => {
    if(technology.modifyCapabilities) {
      forEach(technology.modifyCapabilities, (modifier, capability) => {
        if(!(capability in modifiers)) {
          modifiers[capability] = 1;
        }

        modifiers[capability] += modifier;
      });
    }
  });

  return modifiers;
}
