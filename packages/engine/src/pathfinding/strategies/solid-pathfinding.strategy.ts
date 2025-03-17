import { Vec2, isDefined, type Point, type Point3D } from '@game/shared';
import type { Cell, SerializedCoords } from '../../board/cell';
import type { Game } from '../../game/game';
import type { Edge } from '../dijkstra';
import type { PathfindingStrategy } from './pathinding-strategy';
import { pointToCellId } from '../../board/board-utils';
import type { Unit } from '../../unit/entities/unit.entity';

export type SolidPathfindingStrategyOptions = {
  origin: Point3D;
};

/**
 * A pathfinding strategy for solid bodies that cannot pass through other bodies
 */
export class SolidBodyPathfindingStrategy implements PathfindingStrategy {
  private cache = new Map<SerializedCoords, Edge<SerializedCoords>[]>();

  private origin!: Vec2;

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  done() {
    this.cache.clear();
  }

  setOrigin(origin: Point) {
    this.origin = Vec2.fromPoint(origin);
  }

  computeNeighbors(node: SerializedCoords) {
    const cell = this.game.boardSystem.getCellAt(node)!;

    const edges = this.game.boardSystem
      .getNeighbors(cell.position)
      .filter(neighbor => neighbor.position.isAxisAligned(cell.position));
    const result: Array<{ node: SerializedCoords; weight: number }> = [];

    for (let i = 0; i <= edges.length; i++) {
      const edge = edges[i];
      if (isDefined(edge) && this.isEdgeValid(edge)) {
        result.push({ node: pointToCellId(edge), weight: 1 });
      }
    }
    this.cache.set(node, result);
  }

  isEdgeValid(cell: Cell) {
    if (this.origin.equals(cell)) return false;
    if (cell.unit) return cell.unit.isAlly(this.unit);

    return cell.isWalkable;
  }

  getEdges(node: SerializedCoords): Array<Edge<SerializedCoords>> {
    if (!this.cache.has(node)) {
      this.computeNeighbors(node);
    }
    return this.cache.get(node)!;
  }
}
