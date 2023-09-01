import { useContextSelector } from "components/SelectableContext";
import { shallowEqual } from "react-redux";
import { useEqualityClientStateContext } from "../ClientStateContext";
import { Entity } from "types/game/shared/entities";



export default function useGetEntitiesByIds(ids: number[]) {
    return useEqualityClientStateContext((state) => ids.reduce((output, id) => {
        output[id] = state.entities[id];

        return output;
    }, {} as Record<number, Entity>), shallowEqual)
}