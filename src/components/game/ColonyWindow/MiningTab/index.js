//TODO
//-minerals total footer
//-minerals useage table
//-minerals depletion column
//-minerals production more columns + column groups

import { useMemo } from "react";

//Components
import { Trans } from "@lingui/macro";
import Stack from "components/layout/Stack"
import DataTable from "components/ui/DataTable";
import Entity from "components/game/Entity";

//Hooks
import { useGameConfig } from "components/game/Game";
import { useContextSelector } from "components/SelectableContext";
import useGetEntitiesByIds from "components/game/Game/useGetEntitiesByIds";

//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';

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
    },

    {//number of facilitites
        name: 'count',
        label: <Trans id="mineralsProductionTable.count">#</Trans>,
        sortType: 'numeric',
        format: 'numeric'
    },
    {//production per facility base
        name: 'productionPerMine',
        label: <Trans id="mineralsProductionTable.productionPerMine">Production (<abbr title="metric tons">t</abbr>/mine/year)</Trans>,
        sortType: 'numeric',
        format: 'numeric'
    },
    //TODO labour efficiency
    {//species modifier
        name: 'speciesMod',
        label: <Trans id="mineralsProductionTable.speciesMod">Species mod</Trans>,
        sortType: 'numeric',
        format: 'numeric'
    },
    {//production per mine
        name: 'totalProductionPerMine',
        label: <Trans id="mineralsProductionTable.totalProductionPerMine">Tot. prod. (<abbr title="metric tons">t</abbr>/mine/year)</Trans>,
        sortType: 'numeric',
        format: 'numeric'
    },
    {//Total production
        name: 'totalProduction',
        label: <Trans id="mineralsProductionTable.totalProduction">Total production</Trans>,
        sortType: 'numeric',
        format: 'numeric'
    }
];


//The component
export default function MiningTab({selectedColonyId}) {
    const {minerals, structures} = useGameConfig();//structures? technologies?

    const colony = useContextSelector(state => state.entities[selectedColonyId]);
    const colonySystemBody = useContextSelector(state => state.entities[colony?.systemBodyId]);


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
            return Object.keys(colony.colony.structures).reduce((output, populationId) => {
                const populationStructures = colony.colony.structures[populationId];
                const isAutomated = +populationId === 0;
                const population = isAutomated ?
                    null
                    :
                    colonyPopulations[populationId];
                const populationFacet = population?.population;
                
                const species = isAutomated ?
                    null
                    :
                    populationSpecies[population.speciesId];
                
                Object.keys(populationStructures).forEach((structureId) => {
                    const structureDefinition = structures[structureId];

                    if(structureDefinition.capabilities.mining) {
                        const count = populationStructures[structureId];

                        const productionPerMine = populationFacet.unitCapabilityProduction.mining[structureId];

                        output.push({
                            name: structureDefinition.name,//TODO translate?
                            species: <Entity.Name id={species.id} />,
                            count,
                            productionPerMine: structureDefinition.capabilities.mining,
                            labourEfficiencyMod: isAutomated ? null : populationFacet.labourEfficiencyMod,
                            stabilityMod: isAutomated ? null : populationFacet.stabilityMod,
                            environmentalMod: isAutomated ? null : populationFacet.environmentalMod,
                            speciesMod: isAutomated ?
                                null
                                :
                                species.species.miningRate,
                            totalProductionPerMine: productionPerMine,
                            totalProduction: productionPerMine * count,
                        })
                    }
                });

                return output;

            }, [])
            //TODO read from populations

            // return Object.keys(colony.colony.populationStructuresWithCapability).reduce((output, populationId) => {
            //     const isAutomated = +populationId === 0;
            //     const population = isAutomated ?
            //         null
            //         :
            //         colonyPopulations[populationId];

            //     if(!population) {
            //         return output;
            //     }

            //     const species = isAutomated ?
            //         null
            //         :
            //         populationSpecies[population.speciesId];
                
            //     const mineTypes = colony.colony.populationStructuresWithCapability[populationId].mining;

            //     Object.keys(mineTypes).forEach((structureId) => {
            //         const count = mineTypes[structureId];

            //         const productionPerMine = structures[structureId].capabilities.mining * colony.colony.populationUnitCapabilityProduction[population.id].mining[structureId]

            //         output.push({
            //             name: structures[structureId].name,//TODO translate?
            //             species: <Entity.Name id={species.id} />,
            //             count,
            //             productionPerMine: structures[structureId].capabilities.mining,
            //             speciesMod: isAutomated ?
            //                 null
            //                 :
            //                 species.species.miningRate,
            //             totalProductionPerMine: productionPerMine,
            //             totalProduction: productionPerMine * count,
            //         })
            //     });

            //     return output;
            // }, []);
        },
        [structures, colony.colony.structures, colonyPopulations, populationSpecies]
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
            //colGroups={productionTableGroups}
            data={productionTableData}
        />
    </Stack>
}
