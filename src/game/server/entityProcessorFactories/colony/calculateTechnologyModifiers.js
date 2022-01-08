import forEach from 'helpers/object/forEach';

export default function getTechnologyModifiers(technologies) {
  const modifiers = {};

  forEach(technologies, technology => {
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
