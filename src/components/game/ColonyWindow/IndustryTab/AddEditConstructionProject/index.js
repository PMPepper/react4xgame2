import { useMemo } from "react";
import { Trans, t } from "@lingui/macro";
import { isEmpty } from "lodash";

//Components
import Form from "components/display/Form";
import Stack from "components/layout/Stack";

//Hooks
import { useGameConfig } from "components/game/Game";
import { useContextSelector } from "components/SelectableContext";
import useGetFaction from "components/game/Game/useGetFaction";

//Helpers
import sortOnPropNatsort from "helpers/sorting/sort-on-prop-natsort";
import isConstructionProjectAvailable from "game/utils/isConstructionProjectAvailable";
import forEach from "helpers/object/forEach";
import formatNumber from "helpers/string/format-number";
import Button from "components/ui/Button";


//The component
export default function AddEditConstructionProject({projectId, colonyId}) {
    const isEdit = !!projectId;
    const faction = useGetFaction();
    const {constructionProjects} = useGameConfig();//structures? technologies?

    //Calculated properties
    const groupedConstructionProjects = useMemo(
        () => getAvailableConstructionProjectsGroupedByType(constructionProjects, faction.faction.technology),
        [constructionProjects, faction.faction.technology]
    );

    //Render
    return <Stack component={Form}>
        <div>
            <Form.Select name="project" options={groupedConstructionProjects} />
        </div>
        
        <div>
            <Form.Input name="project" type="number" min="1" step="1" placeholder={t`Quantity to construct`} />
        </div>

        <div>
            <Button>{isEdit ? 
                <Trans>Edit project</Trans>
                :
                <Trans>Add project</Trans>
            }</Button>
        </div>
    </Stack>

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
