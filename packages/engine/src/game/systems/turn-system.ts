import type { Serializable, Values } from '@game/shared';
import { System } from '../../system';
import type { SerializedUnit, Unit } from '../../unit/entities/unit.entity';
import { TypedEventEmitter, TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_EVENTS } from '../game.events';

export const TURN_EVENTS = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end'
} as const;

export class GameTurnEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}
export type TurnEvent = Values<typeof TURN_EVENTS>;

export type TurnEventMap = {
  [TURN_EVENTS.TURN_START]: GameTurnEvent;
  [TURN_EVENTS.TURN_END]: GameTurnEvent;
};

export type SerializedTurnOrder = string[];

export class TurnSystem
  extends System<never>
  implements Serializable<SerializedTurnOrder>
{
  private _turnCount = 0;

  private _processedUnits = new Set<Unit>();

  queue: Unit[] = [];

  private emitter = new TypedEventEmitter<TurnEventMap>();

  initialize() {
    this.game.on(GAME_EVENTS.UNIT_END_TURN, this.onUnitTurnEnd.bind(this));
    this.game.on(GAME_EVENTS.UNIT_AFTER_DESTROY, e => {
      this.removeFromCurrentQueue(e.data.unit);
    });

    this.on(TURN_EVENTS.TURN_START, e => {
      this.game.emit(GAME_EVENTS.TURN_START, e);
    });
    this.on(TURN_EVENTS.TURN_END, e => {
      this.game.emit(GAME_EVENTS.TURN_END, e);
    });
    this.buildQueue();
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }

  serialize() {
    return this.queue.map(unit => unit.id);
  }

  get turnCount() {
    return this._turnCount;
  }

  get activeUnit() {
    return [...this.queue][0];
  }

  get processedUnits() {
    return this._processedUnits;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  private buildQueue() {
    this.game.unitSystem.units
      .sort((a, b) => b.initiative - a.initiative)
      .forEach(unit => this.queue.push(unit));
  }

  startGameTurn() {
    this._turnCount++;
    this.queue = [];
    this._processedUnits.clear();

    this.buildQueue();
    this.emitter.emit(
      TURN_EVENTS.TURN_START,
      new GameTurnEvent({ turnCount: this.turnCount })
    );

    this.activeUnit?.starturn();
  }

  removeFromCurrentQueue(unit: Unit) {
    const idx = this.queue.findIndex(u => u.equals(unit));
    if (idx === -1) return;
    this.queue.splice(idx, 1);
  }

  insertInCurrentQueue(unit: Unit) {
    let idx = this.queue.findIndex(u => u.initiative < unit.initiative);
    if (idx === -1) idx = this.queue.length;
    this.queue.splice(idx, 0, unit);
  }

  endGameTurn() {
    this.emitter.emit(
      TURN_EVENTS.TURN_END,
      new GameTurnEvent({ turnCount: this.turnCount })
    );
  }

  onUnitTurnEnd() {
    this._processedUnits.add(
      this.queue.splice(this.queue.indexOf(this.activeUnit), 1)[0]
    );

    if (!this.activeUnit) {
      this.endGameTurn();
      this.startGameTurn();
      return;
    } else {
      this.activeUnit.starturn();
    }
  }
}
