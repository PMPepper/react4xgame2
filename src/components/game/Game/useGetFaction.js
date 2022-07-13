import { useContextSelector } from "components/SelectableContext";


const getFaction = ({entities, factionId}) => entities[factionId];

export default function useGetFaction() {
    return useContextSelector(getFaction)
}