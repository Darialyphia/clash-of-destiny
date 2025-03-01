import { assert, isDefined, type Point, type Values } from '@game/shared';
import type { SerializedCoords } from './cell';

export const DIRECTION = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
} as const;

export const DIRECTIONS_TO_DIFF = {
  [DIRECTION.NORTH]: { x: 0, y: -1 },
  [DIRECTION.SOUTH]: { x: 0, y: 1 },
  [DIRECTION.WEST]: { x: -1, y: 0 },
  [DIRECTION.EAST]: { x: 1, y: 0 }
} as const satisfies Record<Direction, Point>;

export type Direction = Values<typeof DIRECTION>;

export function assertSerializedcoords(str: string): asserts str is SerializedCoords {
  const [x, y, z] = str.split(':').map(Number);

  return assert(
    isDefined(x) && isDefined(y) && isDefined(z),
    'Invalid serialized coordinates'
  );
}

export const pointToCellId = (point: Point): SerializedCoords => `${point.x}:${point.y}`;

export const cellIdToPoint = (cellId: SerializedCoords): Point => {
  const [x, y] = cellId.split(':').map(Number);

  return { x, y };
};
