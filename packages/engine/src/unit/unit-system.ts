import { isDefined, type Point } from '@game/shared';
import { Unit } from './entities/unit.entity';
import { System } from '../system';

import type { AnyUnitCard } from '../card/entities/unit-card.entity';

// eslint-disable-next-line @typescript-eslint/ban-types
export type UnitSystemOptions = {};

export class UnitSystem extends System<UnitSystemOptions> {
  private unitMap = new Map<string, Unit>();

  private nextUnitId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {}

  shutdown() {
    this.units.forEach(unit => unit.shutdown());
  }

  get units() {
    return [...this.unitMap.values()];
  }

  get unitsOnBoard() {
    return this.units.filter(
      unit => !unit.isDead && unit.position.x >= 0 && unit.position.y >= 0
    );
  }

  getUnitById(id: string) {
    return this.unitMap.get(id) ?? null;
  }

  getUnitAt(position: Point) {
    return (
      this.units.find(e => {
        return e.isAt(position);
      }) ?? null
    );
  }

  getNearbyUnits({ x, y }: Point) {
    // prettier-ignore
    return [
      this.getUnitAt({ x: x - 1, y: y - 1 }), // top left
      this.getUnitAt({ x: x    , y: y - 1 }), // top
      this.getUnitAt({ x: x + 1, y: y - 1 }), // top right
      this.getUnitAt({ x: x - 1, y: y     }),  // left
      this.getUnitAt({ x: x + 1, y: y     }),  // right
      this.getUnitAt({ x: x - 1, y: y + 1 }), // bottom left
      this.getUnitAt({ x: x    , y: y + 1 }), // bottom
      this.getUnitAt({ x: x + 1, y: y + 1 }), // bottom right,
    ].filter(isDefined)
  }

  getJoinedUnits(start: Unit, predicate: (unit: Unit) => boolean) {
    let queue = [start, ...this.getNearbyUnits(start.position).filter(predicate)];
    let visited = new Set<string>(queue.map(unit => unit.id));
    let index = 0;
    while (index < queue.length) {
      const unit = queue[index++];
      const nearby = this.getNearbyUnits(unit.position).filter(
        unit => !visited.has(unit.id) && predicate(unit)
      );
      visited = new Set([...visited, ...nearby.map(unit => unit.id)]);
      queue = [...queue, ...nearby];
    }
    return queue;
  }

  addUnit(card: AnyUnitCard, position: Point) {
    const id = `unit_${++this.nextUnitId}`;
    const unit = new Unit(this.game, card, {
      id,
      position
    });
    this.unitMap.set(unit.id, unit);

    return unit;
  }

  removeUnit(unit: Unit) {
    unit.position.x = -1;
    unit.position.y = -1;
  }

  getEntityBehind(unit: Unit) {
    const { x, y } = unit.position;
    if (unit.player.isPlayer1) {
      return this.getUnitAt({ x: x - 1, y });
    } else {
      return this.getUnitAt({ x: x + 1, y });
    }
  }

  getEntityInFront(unit: Unit) {
    const { x, y } = unit.position;
    if (unit.player.isPlayer1) {
      return this.getUnitAt({ x: x + 1, y });
    } else {
      return this.getUnitAt({ x: x - 1, y });
    }
  }

  getEntityAbove(unit: Unit) {
    const { x, y } = unit.position;
    return this.getUnitAt({ x, y: y - 1 });
  }

  getEntityBelow(unit: Unit) {
    const { x, y } = unit.position;
    return this.getUnitAt({ x, y: y + 1 });
  }

  getClosest(origin: Point, direction: Point) {
    let found: Unit | null = null;
    let cell = this.game.boardSystem.getCellAt({
      x: origin.x + direction.x,
      y: origin.y + direction.y
    });
    while (cell) {
      const unit = this.getUnitAt(cell.position);
      if (unit) {
        found = unit;
        break;
      }
      cell = this.game.boardSystem.getCellAt({
        x: cell.position.x + direction.x,
        y: cell.position.y + direction.y
      });
    }
    return found;
  }
}
