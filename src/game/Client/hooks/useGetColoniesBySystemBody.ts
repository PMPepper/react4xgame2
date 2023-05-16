
//Hooks
import { useContextSelector } from 'components/SelectableContext';
import { shallowEqual } from 'react-redux';
import { EntityColony, EntitySystem } from 'types/game/shared/entities';


//The hook
export default function useGetColoniesBySystemBody(systemId: number): Record<number, EntityColony<false>> {
    return useContextSelector(state => {//TODO type this
        const system: EntitySystem = state.entities[systemId];

        return system.colonyIds.reduce<Record<number, EntityColony<false>>>((output, colonyId) => {
            const colony = state.entities[colonyId];

            if(colony.factionId === state.factionId) {
                output[colony.systemBodyId] = colony;
            }

            return output;
        }, {})

    }, shallowEqual);
}