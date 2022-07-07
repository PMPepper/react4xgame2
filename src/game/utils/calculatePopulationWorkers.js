
export default function calculatePopulationWorkers(population, species, systemBody, colony) {
    if(!colony || colony.type !== 'colony') {
      population.population.supportWorkers = 0;
      population.population.effectiveWorkers = 0;
    } else {
      population.population.supportWorkers = population.population.quantity * species.species.support;//TODO calculate based on environment;
      population.population.effectiveWorkers = (population.population.quantity - population.population.supportWorkers) * species.species.workerMultiplier;
    }
  }