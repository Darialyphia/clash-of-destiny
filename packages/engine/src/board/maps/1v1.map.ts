import { Vec2 } from '@game/shared';
import { TERRAINS, type MapBlueprint } from '../map-blueprint';

type CellBlueprint = MapBlueprint['cells'][number];
const p1 = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  player: 'p1',
  spriteId: 'grass'
});

const p2 = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  player: 'p2',
  spriteId: 'grass'
});

const neutral = (obstacles: string[] = []): CellBlueprint => ({
  terrain: TERRAINS.GROUND,
  obstacles,
  player: null,
  spriteId: 'grass'
});

export const map1v1: MapBlueprint = {
  id: '1v1',
  cols: 11,
  rows: 7,
  boundaries: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 8, y: 0 },
    bottomLeft: { x: 0, y: 6 },
    bottomRight: { x: 8, y: 6 }
  },
  // prettier-ignore
  cells: [
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2(),
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2(),
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2(),
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2(),
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2(),
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2(),
    p1(), p1(), p1(), neutral(), neutral(), neutral(), neutral(), neutral(), p2(), p2(), p2()
  ],
  generalPositions: [new Vec2(0, 2), new Vec2(8, 2)]
};
