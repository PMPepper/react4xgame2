import React, { ReactElement } from 'react';

//Components
import Number from 'components/format/Number';

//Hooks
import { Trans } from '@lingui/macro';
import { useClientStateContext } from '../ClientStateContext';
import { Entity, EntityColony, EntityPopulation, EntitySystem } from 'types/game/shared/entities';
import { isEntityOfType } from 'types/game/base/entityTypeGuards';


//Entity helper components
export default {
    Name: ({id}) => useClientStateContext(state => state?.factionEntities?.[id]?.name) as any as ReactElement || <Trans id="_na">-</Trans>,

    TotalPopulation:({id, ...props}) => <Number decimalPlaces={0} {...props}>{
        useEntityTotalPopulation(id)
    }</Number>
}

//for the current faction
function useEntityTotalPopulation(entityId: number) {
    return useClientStateContext(({factionId, entities}) => {
        const entity = entities[entityId];

        switch(entity.type) {
            case 'colony':
                return getPopulationForLinkedEntities(entities, (entity as EntityColony<false>).populationIds, factionId);
            case 'system':
                return (entity as EntitySystem).colonyIds
                    .map(colonyId => getPopulationForLinkedEntities(entities, (entities[colonyId] as EntityColony<false>).populationIds, factionId))
                    .reduce((a,b)=>a+b, 0)
            case 'population':
                return (entity as EntityPopulation<false>).population.quantity;
            default:
                throw new Error('Unknown entity type');
        }
    });
}

function getPopulationForLinkedEntities(entities: Record<number, Entity>, linkedIds: number[], factionId: number) {
    return linkedIds.reduce((totalPopulation, populationId) => {
        const populationEntity = entities[populationId];

        if(!isEntityOfType(populationEntity, 'population')) {
            return totalPopulation;
        }

        return totalPopulation + (populationEntity.factionId === factionId ?
            populationEntity.population.quantity
            :
            0
        );
    }, 0);
}
