import type { Point, Values } from '@game/shared';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<{
    terrain: Terrain;
    obstacles: string[];
    spriteId: string;
  }>;
  shrinePositions: Point[];
  boundaries: {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
  };
};

export const TERRAINS = {
  GROUND: 'ground',
  WALL: 'wall',
  EMPTY: 'empty'
} as const;

export type Terrain = Values<typeof TERRAINS>;
