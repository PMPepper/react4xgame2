
//Hooks
import { useEqualityClientStateContext } from 'components/game/ClientStateContext';
import { shallowEqual } from 'react-redux';
import { isEntityOfType } from 'types/game/client/entities';
import { Entity, EntityColony } from 'types/game/shared/entities';


//The hook
export default function useGetColoniesBySystemBody(systemId: number): Record<number, EntityColony<false>> {
    return useEqualityClientStateContext(state => {
        if(!state) {
            throw new Error('useGetColoniesBySystemBody cannot be used without a valid context provider');
        }

        const system: Entity = state.entities[systemId];

        if(isEntityOfType(system, 'system')) {
            return system.colonyIds.reduce<Record<number, EntityColony<false>>>((output, colonyId) => {
                const colony = state.entities[colonyId] as EntityColony<false>;
    
                if(colony.factionId === state.factionId) {
                    output[colony.systemBodyId] = colony;
                }
    
                return output;
            }, {})
        } else {
            throw new Error('Error useGetColoniesBySystemBody::invalid systemId');
        }
    }, shallowEqual);
}

