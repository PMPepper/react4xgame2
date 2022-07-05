import { useContextSelector } from "components/SelectableContext";
import { shallowEqual } from "react-redux";



export default function useGetEntitiesByIds(ids) {
    return useContextSelector((state) => ids.reduce((output, id) => {
        output[id] = state.entities[id];

        return output;
    }, {}), shallowEqual)
}