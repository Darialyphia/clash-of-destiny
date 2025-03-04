import { Vec2, type Point } from '@game/shared';
import { dijkstra, findShortestPath } from './dijkstra';
import type { Game } from '../game/game';
import type { SerializedCoords } from '../board/cell';
import { cellIdToPoint, pointToCellId } from '../board/board-utils';
import type { PathfindingStrategy } from './strategies/pathinding-strategy';

export type DistanceMap = {
  costs: ReturnType<typeof dijkstra>['costs'];
  get: (point: Point) => number;
};

export class PathfinderComponent {
  constructor(
    private game: Game,
    private strategy: PathfindingStrategy
  ) {}

  changeStrategy(strategy: PathfindingStrategy) {
    this.strategy = strategy;
  }

  getDistanceMap(from: Point, maxDistance?: number): DistanceMap {
    this.strategy.setOrigin(from);
    const map = dijkstra(this.strategy, {
      startNode: pointToCellId(from),
      maxWeight: maxDistance
    });

    this.strategy.done();

    return {
      costs: map.costs,
      get(pt: Point) {
        return map.costs[pointToCellId(pt)];
      }
    };
  }

  getPathTo(from: Point, to: Point, maxDistance?: number) {
    const entityAtPoint = this.game.unitSystem.getUnitAt(to);
    if (entityAtPoint) return null;

    this.strategy.setOrigin(from);

    const path = findShortestPath<SerializedCoords>(
      this.strategy,
      pointToCellId(from),
      pointToCellId(to),
      maxDistance
    );

    if (!path) return null;
    this.strategy.done();

    return {
      distance: path.distance,
      path: path.path.map(p => Vec2.fromPoint(cellIdToPoint(p)))
    };
  }
}
