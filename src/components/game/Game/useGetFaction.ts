import { ClientGameState } from "types/game/shared/game";
import { useClientStateContext } from "../ClientStateContext";
import { isEntityOfType } from "types/game/client/entities";


const getFaction = ({entities, factionId}: ClientGameState) => entities[factionId];

export default function useGetFaction() {
    const entity = useClientStateContext(getFaction);

    if(!isEntityOfType(entity, 'faction')) {
        throw new Error('Unable to find faction');
    }

    return entity
}