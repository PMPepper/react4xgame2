import toId from './toId';
import toEntity from './toEntity';

export default function getFactionSystemBodyFromFactionAndSystemBody(faction, systemBody, entities) {
  const factionId = toId(faction);
  systemBody = toEntity(systemBody, entities);

  if(!systemBody.factionSystemBodyIds || systemBody.factionSystemBodyIds.length ===0 ) {
    return null;
  }

  const factionSystemBodyId = systemBody.factionSystemBodyIds.find(factionSystemBodyId => (entities[factionSystemBodyId].factionId === factionId));

  return factionSystemBodyId ? entities[factionSystemBodyId] : null;
}
