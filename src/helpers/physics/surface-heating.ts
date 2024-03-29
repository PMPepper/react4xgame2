import {STEFAN_BOLTZMANN} from './consts';

export function surfaceHeating(luminosity: number, albedo: number, distance: number) {
  // L⊙(1−a) / 16πd2ơ
  return (luminosity * (1 - albedo)) / (16 * Math.PI * STEFAN_BOLTZMANN * distance * distance);
}
