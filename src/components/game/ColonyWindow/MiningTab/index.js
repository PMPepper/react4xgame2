//import {  } from "react";

//Components
import { Trans } from "@lingui/macro";
import Stack from "components/layout/Stack"
import DataTable from "components/ui/DataTable";

//Hooks
import { useGameConfig } from "components/game/Game";
import { useContextSelector } from "components/SelectableContext";



//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';
import { useMemo } from "react";
import mapToSortedArray from "helpers/object/map-to-sorted-array";
import { shallowEqual } from "react-redux";
import useGetEntitiesByIds from "components/game/Game/useGetEntitiesByIds";
import Entity from "components/game/Entity";

//TODO depletion
const mineralsTableColumns = [
    {
        name: 'name',
        label: <Trans id="mineralsTable.name">Name</Trans>,
        rowHeader: true,
        sortType: 'alphabetical',
        textAlign: 'start',
    },
    {
        name: 'quantity',
        label: <Trans id="mineralsTable.quantity">Quantity (<abbr title="metric tons">t</abbr>)</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 0
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
        name: 'productionYear',
        label: <Trans id="mineralsTable.production">Per year</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 1
        }
    },
    
    {
        name: 'productionDay',
        label: <Trans id="mineralsTable.production">Per day</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 2
        }
    },
    {
        name: 'stockpile',
        label: <Trans id="mineralsTable.stockpile">Stockpile (<abbr title="metric tons">t</abbr>)</Trans>,
        sortType: 'numeric',
        format: 'numeric',
        formatOptions: {
            decimalPlaces: 0
        }
    }
];

const mineralTableGroups = [
    {
        startColumn: 'productionYear',
        colSpan: 2,
        label: <Trans id="mineralsTable.production">Production (<abbr title="metric tons">t</abbr>)</Trans>,
    }
];

const productionTableColumns = [
    {
        name: 'name',
        label: <Trans id="mineralsProductionTable.name">Mine type</Trans>,
        rowHeader: true,
        sortType: 'alphabetical',
        textAlign: 'start',
    },
    {
        name: 'species',
        label: <Trans id="mineralsProductionTable.name">Operated by</Trans>,
        rowHeader: true,
        sortType: 'alphabetical',
        //textAlign: 'start',
    },

    {//number of facilitites
        name: 'count',
        label: <Trans id="mineralsProductionTable.count">#</Trans>,
        sort: 'numeric',
        format: 'numeric'
    },
    {//production per facility base
        name: 'productionPerFacility',
        label: <Trans id="mineralsProductionTable.productionPerFacility">Production (<abbr title="metric tons">t</abbr>/mine/year)</Trans>,
        sort: 'numeric',
        format: 'numeric'
    },
    {//species modifier
        name: 'speciesMod',
        label: <Trans id="mineralsProductionTable.speciesMod">Species mod</Trans>,
        sort: 'numeric',
        format: 'numeric'
    },
    {//production per mine
        name: 'totalProductionPerFacility',
        label: <Trans id="mineralsProductionTable.totalProductionPerFacility">Tot. prod. (<abbr title="metric tons">t</abbr>/mine/year)</Trans>,
        sort: 'numeric',
        format: 'numeric'
    },
    {//Total production
        name: 'totalProduction',
        label: <Trans id="mineralsProductionTable.totalProduction">Total production</Trans>,
        sort: 'numeric',
        format: 'numeric'
    }
];


//The component
export default function MiningTab({selectedColonyId}) {
    const {minerals, structures} = useGameConfig();//structures? technologies?

    const colony = useContextSelector(state => state.entities[selectedColonyId]);
    const colonySystemBody = useContextSelector(state => state.entities[colony?.systemBodyId]);
console.log(colony, structures)

    const colonyPopulations = useGetEntitiesByIds(colony.populationIds);
    const populationSpecies = useGetEntitiesByIds(Object.values(colonyPopulations).map(({speciesId}) => speciesId));


    const mineralsTableData = useMemo(
        () => {
            return [
                Object.keys(minerals).map((mineralId) => {
                    return {
                        name: minerals[mineralId],
                        quantity: colonySystemBody.availableMinerals[mineralId].quantity,
                        accessibility: colonySystemBody.availableMinerals[mineralId].access,
                        productionYear: colony.colony.capabilityProductionTotals.mining * colonySystemBody.availableMinerals[mineralId].access,
                        productionDay: colony.colony.capabilityProductionTotals.mining * colonySystemBody.availableMinerals[mineralId].access * DAY_ANNUAL_FRACTION,
                        stockpile: colony.colony.minerals[mineralId]
                    };
                })
            ];
        },
        [minerals, colonySystemBody.availableMinerals, colony.colony.capabilityProductionTotals, colony.colony.minerals]
    );

    const productionTableData = useMemo(
        () => {

            return Object.keys(colony.colony.populationStructuresWithCapability).reduce((output, populationId) => {
                const population = colonyPopulations[populationId];

                if(!population) {
                    return output;
                }


                const species = populationSpecies[population.speciesId];
                console.log(species);

                const mineTypes = colony.colony.populationStructuresWithCapability[populationId].mining;

                Object.keys(mineTypes).forEach((structureId) => {
                    const count = mineTypes[structureId];

                    output.push({
                        name: structures[structureId].name,//TODO translate?
                        species: <Entity.Name id={species.id} />,
                        count,
                        productionPerFacility: structures[structureId].capabilities.mining,
                        speciesMod: structures[structureId].workers === 0 ? null : 0,
                        totalProductionPerFacility: null,
                        totalProduction: 0,
                    })
                });

                return output;
            }, [])

            // return mapToSortedArray(
            //     colony.colony.populationStructureWithCapability,
            //     (count, facilityId) => {

            //         return 
            //     },
            //     null,
            // )
        },
        [structures, colony.colony.structuresWithCapability.mining]
    );

    return <Stack>
        <DataTable.Redux
            path="colonyWindow.miningTab.mineralsDataTable"
            caption={<Trans>Colony minerals overview</Trans>}
            columns={mineralsTableColumns}
            colGroups={mineralTableGroups}
            data={mineralsTableData}
        />

        <DataTable.Redux
            path="colonyWindow.miningTab.productionDataTable"
            caption={<Trans>Colony minerals production overview</Trans>}
            columns={productionTableColumns}
            //colGroups={mineralTableGroups}
            data={productionTableData}
        />
    </Stack>
}