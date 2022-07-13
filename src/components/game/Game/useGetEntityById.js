import { useContextSelector } from "components/SelectableContext";



export default function useGetEntityByIds(id) {
    return useContextSelector(({entities}) => entities[id])
}