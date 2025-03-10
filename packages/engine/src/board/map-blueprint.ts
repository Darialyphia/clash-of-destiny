import type { Point, Values } from '@game/shared';

export type MapBlueprint = {
  id: string;
  rows: number;
  cols: number;
  cells: Array<{
    terrain: Terrain;
    obstacles: string[];
    player: 'p1' | 'p2' | null;
    spriteId: string;
  }>;
  generalPositions: Point[];
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
