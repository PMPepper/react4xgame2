import React from "react";
import { Trans } from "@lingui/macro";

//Components
import Progress from "components/ui/Progress"
import Button from "components/ui/Button";
import Popover from "components/ui/Popover";
import AddEditConstructionProject from "./AddEditConstructionProject";


//Hooks
import { useGameConfig } from "components/game/Game";
import { useClientStateContext } from "components/game/ClientStateContext";

//Types
import { isEntityOfType } from "types/game/base/entityTypeGuards";

//The component
export default function IndustryTab({selectedColonyId}: {selectedColonyId: number}) {
    const {constructionProjects} = useGameConfig();//structures? technologies?

    const colony = useClientStateContext(state => state.entities[selectedColonyId]);

    if(!isEntityOfType(colony, 'colony')) {//TODO throw an error?
        return <div>Invalid colony</div>
    }

    const colonyFacet = colony.colony;

    return <div>
        <h4><Trans>Construction queue</Trans></h4>
        <Popover content={<AddEditConstructionProject currentProject={null} colonyId={selectedColonyId} />} overlay modal align={['bottom-center', 'top-center']}>
            <Button><Trans>Add construction project</Trans></Button>
        </Popover>
        {colonyFacet.buildQueue.map(({id, total, completed, constructionProjectId, assignToPopulationId, takeFromPopulationId}, index) => {
            const currentConstructionProject = constructionProjects[constructionProjectId];
            const isFirstOfType = !colony.colony.buildQueue.slice(0, index).some(currentBuildQueueItem => (currentBuildQueueItem.constructionProjectId === constructionProjectId));
            const progress = +completed + (isFirstOfType ? (colony.colony.buildInProgress[constructionProjectId] || 0) / currentConstructionProject.bp : 0);
        
            return <div style={{display: 'flex'}}>
                <span>{currentConstructionProject.name}</span>
                <span>{total}</span>
                <Progress value={progress} max={+total} />
            </div>
        })}
    </div>
}


