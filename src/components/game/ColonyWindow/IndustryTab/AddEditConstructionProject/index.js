import { useMemo, useState } from "react";
import { Trans, t } from "@lingui/macro";
import { isEmpty } from "lodash";

//Components
import Form from "components/ui/Form";
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
//currentProject = {id, total, completed, constructionProjectId, assignToPopulationId, takeFromPopulationId}
export default function AddEditConstructionProject({currentProject, colonyId}) {
    console.log('AddEditConstructionProject :: render');
    
    const isEdit = !!currentProject;
    const faction = useGetFaction();
    const {constructionProjects} = useGameConfig();//structures? technologies?

    //State
    const [formState, setFormState] = useState(() => isEdit ? {...currentProject} : {total: 0, constructionProjectId: '0', assignToPopulationId: '0', takeFromPopulationId: '0'});

    //Calculated properties
    const groupedConstructionProjects = useMemo(
        () => getAvailableConstructionProjectsGroupedByType(constructionProjects, faction.faction.technology),
        [constructionProjects, faction.faction.technology]
    );

    //Render
    return <Grid
        //grid props
        component={Form}
        columns={['auto', 'auto']}
        rowGap="large"
        //form props
        name="constructionForm"
        state={formState}
        setState={setFormState}
        // onChange={(e) => {
        //     const form = e.currentTarget;
        //     console.log(form.checkValidity())
        // }}
    >
        <Grid.Cell component={Form.Label} name="constructionProjectId">
            <Trans>Construction project</Trans>
        </Grid.Cell>
        <Grid.Cell>
            <Form.Select name="constructionProjectId" options={groupedConstructionProjects} required />
        </Grid.Cell>
        
        <Grid.Cell component={Form.Label} name="total">
            <Trans>Quantity</Trans>
        </Grid.Cell>
        <Grid.Cell>
            <Form.Text name="total" type="number" min="1" step="1" placeholder={t`Quantity to construct`} required />
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

    return [
        {
            label: t`- -Please select - -`,
            //value: '0'
        },
        ...groupsOrder.reduce((output, type) => {
            if(groups[type]) {
                groups[type].options.sort(sortFunc);
                output.push(groups[type]);
            }

            return output;
        }, [])
    ];
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
