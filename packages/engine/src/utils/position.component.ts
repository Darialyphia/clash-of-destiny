import { isNumber, Vec2, type Point } from '@game/shared';

export class Position extends Vec2 {
  static fromPoint(pt: Point) {
    return new Position(pt.x, pt.y);
  }

  clone() {
    return new Position(this.x, this.y);
  }

  isWithinCells(point: Point, range: number | Point) {
    if (isNumber(range)) {
      range = { x: range, y: range };
    }

    return Math.abs(point.x - this.x) <= range.x && Math.abs(point.y - this.y) <= range.y;
  }

  isNearby(point: Point) {
    return this.isWithinCells(point, 1);
  }

  isAxisAligned(point: Point) {
    return this.x === point.x || this.y === point.y;
  }
}
