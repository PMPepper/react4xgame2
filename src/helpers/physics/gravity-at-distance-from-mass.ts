import {GRAVITATIONAL_CONSTANT} from './consts';

export default function gravityAtDistanceFromMass(mass: number, distance: number) {
  return (GRAVITATIONAL_CONSTANT * mass) / (distance * distance);
}
