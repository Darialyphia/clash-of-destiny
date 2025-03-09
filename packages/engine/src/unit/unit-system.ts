import { type Point } from '@game/shared';
import { Unit, type UnitOptions } from './entities/unit.entity';
import { System } from '../system';
import { GAME_PHASES } from '../game/systems/game-phase.system';
import type { UnitBlueprint } from '../card/card-blueprint';
import type { Player } from '../player/player.entity';

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
    ].filter
  }

  addUnit(
    player: Player,
    blueprintChain: UnitBlueprint[],
    deck: UnitOptions['deck'],
    position: Point
  ) {
    const id = `unit_${++this.nextUnitId}`;
    const unit = new Unit(this.game, blueprintChain, {
      id,
      player,
      position,
      deck
    });
    this.unitMap.set(unit.id, unit);

    if (this.game.phase === GAME_PHASES.BATTLE) {
      // this.game.turnSystem.insertInCurrentQueue(unit);
    }
    return unit;
  }

  removeUnit(unit: Unit) {
    this.unitMap.delete(unit.id);
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
}
