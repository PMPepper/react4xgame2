import { useClientStateContext } from "../ClientStateContext";

export default function useGetEntityByIds(id: number) {
    return useClientStateContext(({entities}) => entities[id])
}