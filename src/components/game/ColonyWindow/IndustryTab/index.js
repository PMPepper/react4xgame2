

//Components
import Progress from "components/ui/Progress"
import { Trans, t } from "@lingui/macro";
import { isEmpty } from "lodash";

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
import useGetFaction from "components/game/Game/useGetFaction";

//Helpers
// import mapToSortedArray from "helpers/object/map-to-sorted-array";
import sortOnPropNatsort from "helpers/sorting/sort-on-prop-natsort";
import isConstructionProjectAvailable from "game/utils/isConstructionProjectAvailable";
import forEach from "helpers/object/forEach";
import formatNumber from "helpers/string/format-number";


//The component
export default function IndustryTab({selectedColonyId}) {
    const {structures, constructionProjects, research} = useGameConfig();//structures? technologies?

    const colony = useContextSelector(state => state.entities[selectedColonyId]);
    const colonyFacet = colony.colony;

    const faction = useGetFaction();

    //console.log(faction);

    console.log(getAvailableConstructionProjectsGroupedByType(constructionProjects, faction.faction.technology));

    //{mapToSortedArray(constructionProjects, ({name, bp}, id) => <div key={id}>[{id}] {name} ({bp}bp)</div>, sortOnPropNatsort('name'), (project) => isConstructionProjectAvailable(project, faction.faction.technology))}

    return <div>
        <h4>Construction queue</h4>
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


function getAvailableConstructionProjectsGroupedByType(projects, factionTechnology) {
    const groups = {};

    const sortFunc = sortOnPropNatsort('label');//TODO locale

    forEach(projects, (project, id) => {
        if(!isConstructionProjectAvailable(project, factionTechnology)) {
            return;
        }

        const type = getProjectType(project);

        if(!groups[type]) {
            groups[type] = {
                label: projectTypeLabels[type],
                options: []
            }
        }

        groups[type].options.push({
            label: t`${project.name} (${formatNumber(project.bp, 0, /*TODO culture*/)}bp)`,
            value: id
        })
    })

    return groupsOrder.reduce((output, type) => {
        if(groups[type]) {
            groups[type].options.sort(sortFunc);
            output.push(groups[type]);
        }

        return output;
    }, []);
}

const projectTypeLabels = {
    shipyard: t({id: "constructionProjects.type.shipyard", message: "Shipyards"}),
    upgrade: t({id: "constructionProjects.type.upgrade", message: "Upgrade projects"}),//<Trans id="constructionProjects.type.upgrade">Upgrade projects</Trans>,
    construction: t({id: "constructionProjects.type.construction", message: "Construction projects"}),//<Trans id="constructionProjects.type.construction">Construction projects</Trans>,
};

const groupsOrder = ['construction', 'upgrade', 'shipyard'];

function getProjectType(project) {
    if(project.shipyard) {
        return 'shipyard'
    }

    if(!isEmpty(project.requiredStructures)) {
        return 'upgrade';
    }

    return 'construction';
}
