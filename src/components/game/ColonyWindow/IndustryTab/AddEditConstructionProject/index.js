import { useMemo } from "react";
import { Trans, t } from "@lingui/macro";
import { isEmpty } from "lodash";

//Components
import Form from "components/display/Form";
import Grid from "components/layout/Grid";

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
    return <Grid component={Form} columns={['auto', 'auto']} rowGap="large">
        <Grid.Cell component={Form.Label} htmlFor="constructionForm.project">
            <Trans>Construction project</Trans>
        </Grid.Cell>
        <Grid.Cell>
            <Form.Select id="constructionForm.project" name="project" options={groupedConstructionProjects} />
        </Grid.Cell>
        
        <Grid.Cell component={Form.Label} htmlFor="constructionForm.quantity">
            <Trans>Quantity</Trans>
        </Grid.Cell>
        <Grid.Cell>
            <Form.Input id="constructionForm.quantity" name="quantity" type="number" min="1" step="1" placeholder={t`Quantity to construct`} />
        </Grid.Cell>

        <Grid.Cell column="1 / span 2">
            <Button>{isEdit ? 
                <Trans>Edit project</Trans>
                :
                <Trans>Add project</Trans>
            }</Button>
        </Grid.Cell>
    </Grid>

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
