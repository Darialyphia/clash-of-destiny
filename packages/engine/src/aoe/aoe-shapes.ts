import { type Point } from '@game/shared';
import type { Cell } from '../board/cell';
import type { Unit } from '../unit/entities/unit.entity';

export type AOEShape = {
  getCells(points: Point[]): Cell[];
  getUnits(points: Point[]): Unit[];
};
