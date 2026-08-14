import { useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Trans } from "@lingui/macro";

//Components
import Tree from "components/ui/Tree";
import Entity from 'components/game/Entity';

//Hooks
import useRefCallback from "hooks/useRefCallback";

//Consts
const starIcon = <FontAwesomeIcon icon={solid("sun")} />;
const planetIcon = <FontAwesomeIcon icon={solid("globe")} />;
const asteroidIcon = <FontAwesomeIcon icon={solid("cookie")} />;
//const moonIcon = <FontAwesomeIcon icon={solid("minus-square")} />;


//The component
export default function ColonySelector({selectedSystemId, coloniesList, selectedColonyId, setSelectedColonyId}) {
    //Calculated values
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

    const items = useMemo(
        () => [{
            label: <Trans id="colonySelector.systemLabel">
                <Entity.Name id={selectedSystemId} /> (pop. <Entity.TotalPopulation id={selectedSystemId} compact decimalPlaces={1} />)
            </Trans>,
            items: coloniesList,
            expanded: true
        }],
        [selectedSystemId, coloniesList]
    );

    //Callbacks
    const setSelectedTreeItem = useRefCallback(
        (treeItem) => {
            if(treeItem.length > 1) {
                setSelectedColonyId(coloniesList[treeItem[1]].id);
            }
        }
    );

    //Render
    return <Tree items={items} selectedItem={selectedTreeItem} setSelectedItem={setSelectedTreeItem} icons={false} />
}

