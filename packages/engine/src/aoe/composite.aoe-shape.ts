import { isDefined, type Point } from '@game/shared';
import type { AOEShape } from './aoe-shapes';
import type { Cell } from '../board/cell';
import type { Unit } from '../unit/entities/unit.entity';

export class CompositeAOEShape implements AOEShape {
  constructor(
    private shapes: Array<{
      shape: AOEShape;
      getPoints: (points: Point[]) => Point[];
    }>
  ) {}

  getCells(points: Point[]) {
    const cells = new Set<Cell>();
    this.shapes.forEach(shape => {
      const targets = shape.getPoints(points).filter(isDefined);
      if (targets.length === 0) return;
      shape.shape.getCells(targets).forEach(cell => {
        cells.add(cell);
      });
    });

    return [...cells];
  }

  getUnits(points: Point[]) {
    const units = new Set<Unit>();
    this.shapes.forEach(shape => {
      const targets = shape.getPoints(points).filter(isDefined);
      if (targets.length === 0) return;
      shape.shape.getUnits(targets).forEach(unit => {
        units.add(unit);
      });
    });

    return [...units];
  }
}
