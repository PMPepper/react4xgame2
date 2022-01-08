import forEach from '@/helpers/object/forEach';

const allModifierTypes = ['constructionMod', 'miningMod', 'researchMod'];

export default function getTechnologyModifiers(technologies) {
  const modifiers = {};

  allModifierTypes.forEach(type => {modifiers[type] = 1});

  forEach(technologies, technology => {
    allModifierTypes.forEach(type => {
      if(type in technology) {
        modifiers[type] += technology[type];
      }
    });
  });

  return modifiers
}
