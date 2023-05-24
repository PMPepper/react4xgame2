import forEach from 'helpers/object/forEach';
import { ModifyCapabilities, TechnologyDefinition, TechnologyIdType } from 'types/game/shared/definitions';
import { FacetFaction } from 'types/game/shared/facets';

export default function getTechnologyModifiers(factionTechnologies: FacetFaction<true>['technology'], technologies: Record<TechnologyIdType, TechnologyDefinition>): ModifyCapabilities {
  const modifiers: ModifyCapabilities = {};

  forEach(factionTechnologies, (technologyAvailable, technologyId) => {
    
    if(technologyAvailable) {
      const technology = technologies[technologyId];
      
      if(technology.modifyCapabilities) {
        forEach(technology.modifyCapabilities, (modifier, capability) => {
          if(!(capability in modifiers)) {
            modifiers[capability] = 1;
          }
  
          modifiers[capability] += modifier;
        });
      }
    }
    
  });

  return modifiers;
}
