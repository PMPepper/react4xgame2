import {GRAVITATIONAL_CONSTANT} from './consts';

export default function orbitPeriod(orbitRadius, orbitingBodyMass, orbitedBodyMass) {
  if(isNaN(orbitRadius) || orbitRadius < 0 || isNaN(orbitingBodyMass) || orbitingBodyMass < 0 || isNaN(orbitedBodyMass) || orbitedBodyMass < 0) {
    throw new Error('Invalid orbitPeriod values');
  }

  const a = orbitRadius * orbitRadius * orbitRadius;
  const b = GRAVITATIONAL_CONSTANT * (orbitingBodyMass + orbitedBodyMass);

  return 2 * Math.PI * Math.sqrt(a/b);
}
