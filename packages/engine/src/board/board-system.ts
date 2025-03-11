import {
  indexToPoint,
  isDefined,
  isString,
  type Point,
  type Serializable
} from '@game/shared';
import { Cell } from './cell';
import { pointToCellId } from './board-utils';
import { System } from '../system';
import type { MapBlueprint } from './map-blueprint';

export type BoardSystemOptions = {
  map: MapBlueprint;
};

export type SerializedBoard = {
  rows: number;
  columns: number;
  cells: string[];
};

export class BoardSystem
  extends System<BoardSystemOptions>
  implements Serializable<SerializedBoard>
{
  name = 'BOARD SYSTEM';

  color = 'green';

  map!: MapBlueprint;

  cellsMap = new Map<string, Cell>();

  initialize(options: BoardSystemOptions) {
    this.map = options.map;
    this.map.cells.forEach((cell, index) => {
      if (!cell) return;
      const { x, y } = indexToPoint(this.map.cols, index);
      const instance = new Cell(this.game, {
        id: pointToCellId({ x, y }),
        position: { x, y },
        ...cell
      });
      this.cellsMap.set(instance.id, instance);
    });
  }

  shutdown() {}

  serialize() {
    return {
      rows: this.rows,
      columns: this.cols,
      cells: this.cells.map(cell => cell.id)
    };
  }

  get cols() {
    return this.map.cols;
  }

  get rows() {
    return this.map.rows;
  }

  get cells() {
    return [...this.cellsMap.values()];
  }

  getCellAt(posOrKey: string | Point) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }
    return this.cellsMap.get(pointToCellId(posOrKey)) ?? null;
  }

  getManhattanDistance(p1: Point, p2: Point) {
    return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
  }

  getNeighbors(point: Point) {
    return [
      this.getCellAt({ x: point.x - 1, y: point.y - 1 }),
      this.getCellAt({ x: point.x - 1, y: point.y }),
      this.getCellAt({ x: point.x - 1, y: point.y + 1 }),
      this.getCellAt({ x: point.x, y: point.y - 1 }),
      this.getCellAt({ x: point.x, y: point.y + 1 }),
      this.getCellAt({ x: point.x + 1, y: point.y - 1 }),
      this.getCellAt({ x: point.x + 1, y: point.y }),
      this.getCellAt({ x: point.x + 1, y: point.y + 1 })
    ].filter(isDefined);
  }
}
