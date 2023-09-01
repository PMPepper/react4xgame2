import { createSlice } from '@reduxjs/toolkit';

import * as RenderFlags from 'components/SystemMap/renderFlags';
import { SystemBodyTypes } from 'types/game/shared/definitions';
import { RelationshipTypes } from 'types/game/shared/game';

export type SystemMapSystemBodyOptions = {
  body: number;//renderFlags
  label: number;//renderFlags
  orbit: number;//renderFlags
};

export type SystemMapDisplayOptions = {
  highlightColonies: boolean;
  highlightMinerals: boolean;
  bodies: Record<SystemBodyTypes, SystemMapSystemBodyOptions>;
  fleets: Record<RelationshipTypes, boolean>;
}

export type SystemMapControlsOptions = {
  fast: number,
  scrollUp: number[],
  scrollRight: number[],
  scrollDown: number[],
  scrollLeft: number[],
  zoomIn: number[],
  zoomOut: number[],
};

export type SystemMapOptionsType = {
  display: SystemMapDisplayOptions;
  controls: SystemMapControlsOptions;
  mouseEdgeScrolling: number;
};

const initialState: SystemMapOptionsType = {
    display: {
      highlightColonies: true,
      highlightMinerals: true,
      bodies: {
        asteroid: {
          body: RenderFlags.ALL,
          label: RenderFlags.ALL,
          orbit: 0
        },
        moon: {
          body: RenderFlags.ALL,
          label: RenderFlags.ALL,
          orbit: RenderFlags.ALL
        },
        planet: {
          body: RenderFlags.ALL,
          label: RenderFlags.ALL,
          orbit: RenderFlags.ALL
        },
        dwarfPlanet: {
          body: RenderFlags.ALL,
          label: RenderFlags.ALL,
          orbit: RenderFlags.ALL
        },
        gasGiant: {
          body: RenderFlags.ALL,
          label: RenderFlags.ALL,
          orbit: RenderFlags.ALL
        },
        star: {
          body: RenderFlags.ALL,
          label: RenderFlags.ALL,
          orbit: RenderFlags.ALL
        },
      },
      fleets: {
        self: true,
        allied: true,
        neutral: true,
        enemy: true,
      },
    },
    controls: {//16, 33, 34, 37, 38, 39, 40, 87, 68, 83, 65
      fast: 16,
      scrollUp: [38, 87],
      scrollRight: [39, 68],
      scrollDown: [40, 83],
      scrollLeft: [37, 65],
      zoomIn: [34],
      zoomOut: [33],
    },
    mouseEdgeScrolling: 20,
  };

export const slice = createSlice({
    name: 'systemMapOptions',
    initialState,
    reducers: {},
});

//export const { set } = slice.actions
export default slice.reducer