import {GRAVITATIONAL_CONSTANT} from './consts';

export default function gravityAtDistanceFromMass(mass, distance) {
  return (GRAVITATIONAL_CONSTANT * mass) / (distance * distance);
}
