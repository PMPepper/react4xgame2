
//Helpers
import forEach from 'helpers/object/forEach';

//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';


//The processor factory
export default function mineralDepletionFactory(lastTime, time) {
    const lastDay = Math.floor(lastTime / 86400);
    const today = Math.floor(time / 86400);
  
    if(lastDay !== today) {
        return function mineralDepletion(entity, entities, factionEntities, gameConfig) {
            if(entity.type === 'systemBody' && entity.colonyIds?.length > 0) {
                let hasProduction = false;

                //reduce minerals by colony mining activities
                forEach(gameConfig.minerals, (mineralName, mineralId) => {
                    const systemBodyMinerals = entity.availableMinerals[mineralId];

                    //can't produce more than there is
                    const totalDailyProduction = Math.min(systemBodyMinerals.quantity, entity.colonyIds.map((colonyId) => {
                        const colony = entities[colonyId];
                        const miningProduction = colony.colony.capabilityProductionTotals.mining;

                        return miningProduction * systemBodyMinerals.access * DAY_ANNUAL_FRACTION;
                    }).reduce((a, b) => a+b, 0));

                    if(totalDailyProduction > 0) {
                        hasProduction = true;
                    }

                    //technically allows extracion of more minerals than there are, but it's minor, and would be a big job to fix for a very small edge case
                    entity.availableMinerals[mineralId].quantity -= totalDailyProduction;
                });

                //return true if any mining going on, otherwise false
                return ['availableMinerals'];
            }
  
  
            return false;
        }
    }
  
    return null
}

