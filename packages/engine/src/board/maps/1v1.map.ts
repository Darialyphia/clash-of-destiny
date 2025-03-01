import { Vec2 } from '@game/shared';
import { TERRAINS, type MapBlueprint } from '../map-blueprint';

type CellBlueprint = MapBlueprint['cells'][number];
const p1 = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  player: 'p1'
});
const p2 = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  player: 'p2'
});
const neutral = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  player: null
});

export const map1v1: MapBlueprint = {
  id: '1v1',
  cols: 9,
  rows: 5,
  boundaries: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 8, y: 0 },
    bottomLeft: { x: 0, y: 4 },
    bottomRight: { x: 8, y: 4 }
  },
  // prettier-ignore
  cells: [
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
    p1(), p1(), p1(), p1(), neutral(), p2(), p2(), p2(), p2(),
  ],
  generalPositions: [new Vec2(0, 2), new Vec2(8, 2)]
};
