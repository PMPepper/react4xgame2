import React, { useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Trans } from "@lingui/macro";

//Components
import Entity from 'components/game/Entity';
import Tabs from 'components/ui/Tabs';
import Overflow from 'components/layout/Overflow';
import ColonySelector from './ColonySelector';
import MiningTab from './MiningTab';
import IndustryTab from './IndustryTab';
import ResearchTab from './ResearchTab';
import ShipyardsTab from './ShipyardsTab';

//TEMP
import TestTab from './TestTab';

//Hooks
import useGetColoniesBySystemBody from "game/Client/hooks/useGetColoniesBySystemBody";

//Other
import classes from './ColonyWindow.module.scss';
import useAppSelector from 'hooks/useAppSelector';
import { useEqualityClientStateContext } from '../ClientStateContext';
import { isEntityOfType } from 'types/game/base/entityTypeGuards';
import { EntitySystemBody } from 'types/game/shared/entities';


//The component
export default function ColonyWindow() {

    const selectedSystemId = useAppSelector(state => state.selectedSystemId);
    const coloniesList = useGetColoniesList(selectedSystemId);

    //Internal state
    const [selectedColonyId, setSelectedColonyId] = useState(() => coloniesList?.[0]?.id);

    //Render
    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <ColonySelector selectedSystemId={selectedSystemId} coloniesList={coloniesList} selectedColonyId={selectedColonyId} setSelectedColonyId={setSelectedColonyId} />
        </div>

        <div className={classes.main}>
            {selectedColonyId && <Tabs.Redux path="colonyWindow.selectedTab" sizeToParent>
                <Tabs.Tab label="Mining" component={Overflow}>
                    <MiningTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Industry" component={Overflow}>
                    <IndustryTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Research" component={Overflow}>
                    <ResearchTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Shipyards" component={Overflow}>
                    <ShipyardsTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Tests" component={Overflow}>
                    <TestTab />
                </Tabs.Tab>
            </Tabs.Redux>}
        </div>
    </div>
}


//internal helpers
function useGetColoniesList(selectedSystemId: number) {
    const colonies = useGetColoniesBySystemBody(selectedSystemId);

    const systemBodyIds = useMemo(
        () => {
            return Object.values(colonies).map(({systemBodyId}) => systemBodyId)
        },
        [colonies]
    );

    const sortedSystemBodies = useSortSystemBodiesByPosition(systemBodyIds);

    return useMemo(
        () => sortedSystemBodies.map((systemBody) => {
            const colony = colonies[systemBody.id]

            return {
                id: colony.id,
                label: <Trans id="colonySelector.colonyLabel"><Entity.Name id={systemBody.id} /> (pop. <Entity.TotalPopulation id={colony.id} compact decimalPlaces={1} />)</Trans>
            };
        }),
        [colonies]
    );
}

//requires that all system bodies are in the same system to work, otherwise the resuls are undefined
function useSortSystemBodiesByPosition(systemBodyIds: number[]) {
    const systemBodies = useEqualityClientStateContext(
        state => systemBodyIds.map((id) => state.entities[id]).filter((entity) => isEntityOfType(entity, 'systemBody')) as EntitySystemBody<false>[],
        shallowEqual
    );

    return useMemo(
        () => systemBodies.sort(systemBodyPositionCollator),
        [systemBodies]
    )
}

function systemBodyPositionCollator(a: EntitySystemBody<false>, b: EntitySystemBody<false>) {
    const positionA = a.systemBody.position;
    const positionB = b.systemBody.position;

    let i = 0;
    let diff = 0;

    do {
        diff = (positionA[i] ?? -1) - (positionB[i] ?? -1);
        ++i;
    } while(diff === 0);

    return diff;
}
