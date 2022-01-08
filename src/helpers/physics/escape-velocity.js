import {GRAVITATIONAL_CONSTANT} from './consts';

export default function escapeVelocity (mass, distance) {
  return Math.sqrt((2*GRAVITATIONAL_CONSTANT*mass)/distance);
}
