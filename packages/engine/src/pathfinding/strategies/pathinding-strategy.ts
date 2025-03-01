import type { Point } from '@game/shared';
import type { SerializedCoords } from '../../board/cell';
import type { Edge } from '../dijkstra';

export type PathfindingStrategy = {
  getEdges(node: SerializedCoords): Array<Edge<SerializedCoords>>;
  setOrigin(origin: Point): void;
  done(): void;
};
