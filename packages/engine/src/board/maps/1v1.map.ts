import { Vec2 } from '@game/shared';
import { TERRAINS, type MapBlueprint } from '../map-blueprint';

type CellBlueprint = MapBlueprint['cells'][number];
const grass = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  spriteId: 'grass'
});

export const map1v1: MapBlueprint = {
  id: '1v1',
  cols: 9,
  rows: 5,
  boundaries: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 8, y: 0 },
    bottomLeft: { x: 0, y: 6 },
    bottomRight: { x: 8, y: 6 }
  },
  // prettier-ignore
  cells: [
    grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(),
    grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(),
    grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(),
    grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(),
    grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(), grass(),
  ],
  generalPositions: [new Vec2(0, 2), new Vec2(8, 2)]
};
