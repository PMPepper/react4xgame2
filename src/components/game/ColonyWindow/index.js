import { useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Trans } from "@lingui/macro";

//Components
import Entity from 'components/game/Entity';
import Tabs from 'components/ui/Tabs';
import ColonySelector from './ColonySelector';
import MiningTab from './MiningTab';
import IndustryTab from './IndustryTab';
import ResearchTab from './ResearchTab';
import ShipyardsTab from './ShipyardsTab';

//TEMP
import TestTab from './TestTab';

//Hooks
import useGetColoniesBySystemBody from "game/Client/hooks/useGetColoniesBySystemBody";
import { useContextSelector } from 'components/SelectableContext';

//Other
import classes from './ColonyWindow.module.scss';


//The component
export default function ColonyWindow() {

    const selectedSystemId = useSelector(state => state.selectedSystemId);
    const coloniesList = useGetColoniesList(selectedSystemId);

    //Internal state
    const [selectedColonyId, setSelectedColonyId] = useState(() => coloniesList?.[0]?.id);

    //Render
    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <ColonySelector selectedSystemId={selectedSystemId} coloniesList={coloniesList} selectedColonyId={selectedColonyId} setSelectedColonyId={setSelectedColonyId} />
        </div>

        <div className={classes.main}>
            {selectedColonyId && <Tabs.Redux path="colonyWindow.selectedTab">
                <Tabs.Tab label="Mining">
                    <MiningTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Industry">
                    <IndustryTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Research">
                    <ResearchTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Shipyards">
                    <ShipyardsTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Tests">
                    <TestTab />
                </Tabs.Tab>
            </Tabs.Redux>}
        </div>
    </div>
}


//internal helpers
function useGetColoniesList(selectedSystemId) {
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
function useSortSystemBodiesByPosition(systemBodyIds) {
    const systemBodies = useContextSelector(
        state => systemBodyIds.map((id) => state.entities[id]),
        shallowEqual
    );

    return useMemo(
        () => systemBodies.sort(systemBodyPositionCollator),
        [systemBodies]
    )
}

function systemBodyPositionCollator(a, b) {
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
