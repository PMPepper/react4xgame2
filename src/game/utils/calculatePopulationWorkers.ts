import { EntityPopulation, EntitySpecies, EntitySystemBody, EntityColony } from "types/game/server/entities";

export default function calculatePopulationWorkers(population: EntityPopulation<true>, species: EntitySpecies<true>, systemBody: EntitySystemBody<true>, colony: EntityColony<true>) {
    if(!colony || colony.type !== 'colony') {
        population.population.supportWorkers = 0;
        population.population.effectiveWorkers = 0;
    } else {
        //TODO include environment, hash environment = more support workers (that's why we need systemBody)
        population.population.supportWorkers = Math.floor(population.population.quantity * species.species.support);
        population.population.effectiveWorkers = Math.floor(population.population.quantity - population.population.supportWorkers);
    }
  }