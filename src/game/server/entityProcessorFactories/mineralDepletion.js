
//Helpers
import forEach from 'helpers/object/forEach';

//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';


//The entity processor
export default {
    type: 'systemBody',//TODO this is very inefficient, as I only care about systembodies that have colonies
    frequency: 'day',
    init: false,
    processor(systemBody, entities, factionEntities, gameConfig) {
        if(!systemBody.colonyIds?.length) {
            return;
        }

        let hasProduction = false;

        //reduce minerals by colony mining activities
        forEach(gameConfig.minerals, (mineralName, mineralId) => {
            const systemBodyMinerals = systemBody.availableMinerals[mineralId];

            //can't produce more than there is
            const totalDailyProduction = Math.min(systemBodyMinerals.quantity, systemBody.colonyIds.map((colonyId) => {
                const colony = entities[colonyId];
                const miningProduction = colony.colony.capabilityProductionTotals.mining;

                return miningProduction * systemBodyMinerals.access * DAY_ANNUAL_FRACTION;
            }).reduce((a, b) => a+b, 0));

            if(totalDailyProduction > 0) {
                hasProduction = true;
            }

            //technically allows extracion of more minerals than there are, but it's minor, and would be a big job to fix for a very small edge case
            systemBody.availableMinerals[mineralId].quantity -= totalDailyProduction;
        });

        //return true if any mining going on, otherwise false
        return ['availableMinerals'];
    }
}

