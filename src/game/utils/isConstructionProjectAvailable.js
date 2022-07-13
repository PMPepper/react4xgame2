

export default function isConstructionProjectAvailable(project, factionTechnology) {
    return !project.requireTechnologyIds || project.requireTechnologyIds.every((technologyId) => factionTechnology[technologyId]);
}