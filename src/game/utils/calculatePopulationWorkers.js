
export default function calculatePopulationWorkers(population, species, systemBody, colony) {
    if(!colony || colony.type !== 'colony') {
        population.population.supportWorkers = 0;
        population.population.effectiveWorkers = 0;
    } else {
        //TODO include environment, hash environment = more support workers
        population.population.supportWorkers = population.population.quantity * species.species.support;
        population.population.effectiveWorkers = population.population.quantity - population.population.supportWorkers;
    }
  }