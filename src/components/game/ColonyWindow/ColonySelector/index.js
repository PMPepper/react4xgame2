//TODO init tree expanded
import { useMemo } from "react";
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Trans } from "@lingui/macro";

//Components
import Tree from "components/ui/Tree";
import Entity from 'components/game/Entity';

//Hooks
import useGetColoniesBySystemBody from "game/Client/hooks/useGetColoniesBySystemBody";
import { useGetContextState } from 'components/SelectableContext';

//Helpers
import mapToSortedArray from "helpers/object/map-to-sorted-array";
import useRefCallback from "hooks/useRefCallback";

//Consts
const starIcon = <FontAwesomeIcon icon={solid("sun")} />;
const planetIcon = <FontAwesomeIcon icon={solid("globe")} />;
const asteroidIcon = <FontAwesomeIcon icon={solid("cookie")} />;
//const moonIcon = <FontAwesomeIcon icon={solid("minus-square")} />;


//The component
export default function ColonySelector({selectedColonyId, setSelectedColonyId}) {
    const {entities} = useGetContextState()();
    const selectedSystemId = useSelector(state => state.selectedSystemId);

    const colonies = useGetColoniesBySystemBody(selectedSystemId);
    const coloniesList = mapToSortedArray(
        colonies, 
        ({id, systemBodyId}) => ({
            id,
            label: <Trans id="colonySelector.colonyLabel"><Entity.Name id={systemBodyId} /> (pop. <Entity.TotalPopulation id={id} compact decimalPlaces={1} />)</Trans>
        }),
        (a, b) => {
            const positionA = getSystemBodyOrbitingPosition(entities, entities[a.systemBodyId]);
            const positionB = getSystemBodyOrbitingPosition(entities, entities[b.systemBodyId]);

            let i = 0;
            let diff = 0;

            do {
                diff = (positionA[i] ?? -1) - (positionB[i] ?? -1);
                ++i;
            } while(diff === 0);

            return diff;
        }
    )

    //TODO memoisation is pointless unless I also memoise coloniesList
    const selectedTreeItem = useMemo(
        () => {
            const colonyIndex = coloniesList.findIndex(({id}) => id === selectedColonyId);

            return colonyIndex === -1 ?
                null
                :
                [0, colonyIndex]
        },
        [selectedColonyId, coloniesList]
    );

    const setSelectedTreeItem = useRefCallback(
        (treeItem) => {
            if(treeItem.length > 1) {
                setSelectedColonyId(coloniesList[treeItem[1]].id);
            }
        }
    );

    //TODO memoise (need to memoise coloniesList first)
    const items = [{
        label: <Trans id="colonySelector.systemLabel">
            <Entity.Name id={selectedSystemId} /> (pop. <Entity.TotalPopulation id={selectedSystemId} compact decimalPlaces={1} />)
        </Trans>,
        items: coloniesList,
        expanded: true
    }];

    return <>
        <Tree items={items} selectedItem={selectedTreeItem} setSelectedItem={setSelectedTreeItem} icons={false} />
    </>
}

function getSystemBodyOrbitingPosition(entities, systemBody) {
    const output = [];

    let curEntity = systemBody;
    let parentEntity = null;

    while((parentEntity = entities[curEntity?.movement?.orbitingId])) {
        const position = parentEntity.systemBody.children.findIndex((childId) => childId === curEntity.id);

        output.unshift(position);

        curEntity = parentEntity;
    }

    return output;
}