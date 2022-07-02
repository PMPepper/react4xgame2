//Components
import Number from 'components/format/Number';

//Hooks
import { Trans } from '@lingui/macro';
import { useContextSelector } from 'components/SelectableContext';


//Entity helper components
export default {
    Name: ({id}) => useContextSelector(state => state?.factionEntities?.[id]?.name) || <Trans id="_na">-</Trans>,

    TotalPopulation:({id, ...props}) => <Number decimalPlaces={0} {...props}>{
        useEntityTotalPopulation(id)
    }</Number>
}

//for the current faction
function useEntityTotalPopulation(entityId) {
    return useContextSelector(({factionId, entities}) => {
        const entity = entities[entityId];

        switch(entity.type) {
            case 'colony':
                return getPopulationForLinkedEntities(entities, entity.populationIds, factionId);
            case 'system':
                return entity.colonyIds
                    .map(colonyId => getPopulationForLinkedEntities(entities, entities[colonyId].populationIds, factionId))
                    .reduce((a,b)=>a+b, 0)
            case 'population':
                return entity.population.quantity;
            default:
                throw new Error('Unknown entity type');
        }
    });
}

function getPopulationForLinkedEntities(entities, linkedIds, factionId) {
    return linkedIds.reduce((totalPopulation, populationId) => {
        const populationEntity = entities[populationId];

        return totalPopulation + (populationEntity.factionId === factionId ?
            populationEntity.population.quantity
            :
            0
        );
    }, 0);
}

// function getLinkedEntities(entities, linkedEntites) {

// }