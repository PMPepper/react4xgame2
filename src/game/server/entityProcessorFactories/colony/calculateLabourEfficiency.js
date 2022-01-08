

export default function calculateLabourEfficiency(colony, species, totalEffectiveWorkers, totalRequiredWorkforce, entities) {
  return Math.min(1, Math.floor(totalEffectiveWorkers) / totalRequiredWorkforce); //TODO add environment, happiness and any other modifiers here
}
