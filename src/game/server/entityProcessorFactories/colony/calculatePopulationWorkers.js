

export default function calculatePopulationWorkers(population, entities) {
  const colony = entities[population.colonyId];

  if(!colony || colony.type !== 'colony') {
    population.population.supportWorkers = 0;
    population.population.effectiveWorkers = 0;
  } else {
    const species = entities[population.speciesId];

    population.population.supportWorkers = population.population.quantity * species.species.support;//TODO calculate based on environment;
    population.population.effectiveWorkers = (population.population.quantity - population.population.supportWorkers) * species.species.workerMultiplier;
  }
}
