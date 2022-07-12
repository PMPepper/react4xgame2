

//Components
import Progress from "components/ui/Progress"

// {
//     id
//     total,
//     completed: 0,
//     constructionProjectId,
//     assignToPopulationId, takeFromPopulationId
//   }

//Hooks
import { useGameConfig } from "components/game/Game";
import { useContextSelector } from "components/SelectableContext";


//The component
export default function IndustryTab({selectedColonyId}) {
    const {structures, constructionProjects} = useGameConfig();//structures? technologies?

    const colony = useContextSelector(state => state.entities[selectedColonyId]);
    const colonyFacet = colony.colony;

    return <div>
        <h4>Construction projects</h4>
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