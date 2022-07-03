//import {  } from "react";

//Components
import { Trans } from "@lingui/macro";
import Stack from "components/layout/Stack"
import DataTable from "components/ui/DataTable";

//Hooks
import { useGameConfig } from "components/game/Game";
import { useContextSelector } from "components/SelectableContext";

//Consts
const mineralsTableColumns = [
    {
        name: 'name',
        label: <Trans id="mineralsTable.name">Name</Trans>,
        rowHeader: true,
        sortType: 'alphabetical'
    },
    {
        name: 'quantity',
        label: <Trans id="mineralsTable.quantity">Quantity (t)</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 0//TODO this isn't working?
        }
    },
    {
        name: 'accessibility',
        label: <Trans id="mineralsTable.accessibility">Accessibility</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 1
        }
    },
    {
        name: 'production',
        label: <Trans id="mineralsTable.production">Production (t/year)</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 0
        }
    },
    {
        name: 'stockpile',
        label: <Trans id="mineralsTable.stockpile">Stockpile (t)</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 0
        }
    }
];


//The component
export default function MiningTab({selectedColonyId}) {
    const {minerals} = useGameConfig();//structures? technologies?

    const colony = useContextSelector(state => state.entities[selectedColonyId]);
    const colonySystemBody = useContextSelector(state => state.entities[colony?.systemBodyId]);

    console.log(colony, colonySystemBody);

    const mineralsTableData = [
        Object.keys(minerals).map((mineralId) => {
            return {
                name: minerals[mineralId],
                quantity: colonySystemBody.availableMinerals[mineralId].quantity,
                accessibility: colonySystemBody.availableMinerals[mineralId].access,
                production: colony.colony.capabilityProductionTotals.mining * colonySystemBody.availableMinerals[mineralId].access,
                stockpile: colony.colony.minerals[mineralId]
            };
        })
    ];

    return <Stack>
        <DataTable
            caption={<Trans>Colony minerals overview</Trans>}
            columns={mineralsTableColumns}
            data={mineralsTableData}
            //onSort={onSort} sortDir={sortDir} sortCol={sortCol}
        />
    </Stack>
}