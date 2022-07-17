import { Trans, t } from "@lingui/macro";

//Components
import Progress from "components/ui/Progress"
import Button from "components/ui/Button";
import Popover from "components/ui/Popover";
import AddEditConstructionProject from "./AddEditConstructionProject";


//Hooks
import { useGameConfig } from "components/game/Game";
import { useContextSelector } from "components/SelectableContext";
import useGetFaction from "components/game/Game/useGetFaction";

//Helpers
// import mapToSortedArray from "helpers/object/map-to-sorted-array";


// {
//     id
//     total,
//     completed: 0,
//     constructionProjectId,
//     assignToPopulationId, takeFromPopulationId
//   }

//The component
export default function IndustryTab({selectedColonyId}) {
    const {structures, constructionProjects} = useGameConfig();//structures? technologies?

    const colony = useContextSelector(state => state.entities[selectedColonyId]);
    const colonyFacet = colony.colony;

    const faction = useGetFaction();

    return <div>
        <h4>Construction queue</h4>
        <Popover content={<AddEditConstructionProject projectId={null} colonyId={selectedColonyId} />} overlay modal align={['bottom-center', 'top-center']}>
            <Button><Trans>Add construction project</Trans></Button>
        </Popover>
        {colonyFacet.buildQueue.map(({id, total, completed, constructionProjectId, assignToPopulationId, takeFromPopulationId}, index) => {
            const currentConstructionProject = constructionProjects[constructionProjectId];
            const isFirstOfType = !colony.colony.buildQueue.slice(0, index).some(currentBuildQueueItem => (currentBuildQueueItem.constructionProjectId === constructionProjectId));
            const progress = +completed + (isFirstOfType ? (colony.colony.buildInProgress[constructionProjectId] || 0) / currentConstructionProject.bp : 0);
        
            <div style={{display: 'flex'}}>
                <span>{currentConstructionProject.name}</span>
                <span>{total}</span>
                <Progress value={progress} max={+total} />
            </div>
        })}
    </div>
}


