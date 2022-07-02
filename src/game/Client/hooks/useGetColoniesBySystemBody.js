
//Hooks
import { useContextSelector } from 'components/SelectableContext';
import { shallowEqual } from 'react-redux';


//The hook
export default function useGetColoniesBySystemBody(systemId) {
    return useContextSelector(state => {
        const system = state.entities[systemId];

        return system.colonyIds.reduce((output, colonyId) => {
            const colony = state.entities[colonyId];

            if(colony.factionId === state.factionId) {
                output[colony.systemBodyId] = colony;
            }

            return output;
        }, {})

    }, shallowEqual);
}