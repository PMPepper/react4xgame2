
import { ConstructionProjectDefinition } from 'types/game/shared/definitions';
import { FacetFaction } from 'types/game/shared/facets';

export default function isConstructionProjectAvailable(project: ConstructionProjectDefinition, factionTechnology: FacetFaction<true>['technology']) {
    return !project.requireTechnologyIds || project.requireTechnologyIds.every((technologyId) => factionTechnology[technologyId]);
}