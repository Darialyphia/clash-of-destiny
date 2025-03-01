import type { BetterOmit } from '@game/shared';
import type { CellOptions } from '../cell';
import { TERRAINS } from '../map-blueprint';

export const plainTileset = {
  GROUND(player: 'p1' | 'p2' | null) {
    return { terrain: TERRAINS.GROUND, spriteId: 'ground', player, obstacles: [] };
  },

  WATER(player: 'p1' | 'p2' | null) {
    return { terrain: TERRAINS.WALL, spriteId: 'wall', obstacles: [], player };
  }
} satisfies Record<
  string,
  (player: 'p1' | 'p2' | null) => BetterOmit<CellOptions, 'id' | 'position'>
>;
