export default function movementFactory(lastTime, time) {
  const updatedEntities = {};

  function regularOrbitPositionAtTime(entity, entities) {
    if(!entity.movement || !entity.movement.orbitingId) {
      return;
    }

    const parent = entities[entity.movement.orbitingId];
    const orbit = entity.movement;

    const orbitRadius = orbit.radius;
    const orbitalPeriod = orbit.period;
    const orbitFraction = ((time + (orbitalPeriod * orbit.offset)) % orbitalPeriod)/orbitalPeriod;
    const orbitAngle = orbitFraction * Math.PI * 2;
    const position = entity.position;

    let newPositionX = orbitRadius * Math.cos(orbitAngle);
    let newPositionY = orbitRadius * Math.sin(orbitAngle);

    if(parent) {
      if(parent.movement) {
        movement(parent, entities);
      }

      newPositionX += parent.position.x;
      newPositionY += parent.position.y;
    }

    if(position.x !== newPositionX || position.y !== newPositionY) {
      position.x = newPositionX;
      position.y = newPositionY;

      return true;
    }

    return false;
  }

  function movement(entity, entities) {
    if(!entity.movement) {//ignore entities that do not have movement definitio
      return;
    }

    const id = entity.id;

    //If this entity has already been processed, return the result of that
    if(id in updatedEntities) {
      return updatedEntities[id];
    }

    let result = false;

    switch(entity.movement.type) {
      case 'orbitRegular':
        result = regularOrbitPositionAtTime(entity, entities);
    }

    //record the result to prevent repeat processing
    return updatedEntities[id] = result;
  }

  return movement;
}
