import { assert, type Point } from '@game/shared';
import type { Game } from '../../game/game';
import { GameCardEvent } from '../../game/game.events';
import type { Player } from '../../player/player.entity';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import type { Unit } from '../../unit/entities/unit.entity';
import { Interceptable } from '../../utils/interceptable';
import type { UnitBlueprint } from '../card-blueprint';
import { CARD_EVENTS, type UnitType } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';
import { NotEnoughManaError } from '../card-errors';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { PointAOEShape } from '../../aoe/point.aoe-shape';

export type SerializedUnitCard = SerializedCard & {
  baseAtk: number;
  atk: number;
  baseMaxHp: number;
  maxHp: number;
  unitType: UnitType;
  manaCost: number;
};

const makeInterceptors = () => ({
  manaCost: new Interceptable<number>(),
  maxHp: new Interceptable<number>(),
  atk: new Interceptable<number>(),
  canPlayAt: new Interceptable<boolean, { point: Point }>()
});
export type UnitCardInterceptor = ReturnType<typeof makeInterceptors>;

export class UnitCard extends Card<
  SerializedUnitCard,
  CardEventMap,
  UnitCardInterceptor,
  UnitBlueprint
> {
  unit!: Unit;

  constructor(game: Game, player: Player, options: CardOptions) {
    super(game, player, makeInterceptors(), options);
    this.forwardListeners();
    this.blueprint.onInit(this.game, this);
  }

  get hasEnoughMana() {
    return this.manaCost <= this.player.mana;
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.player,
      getNextTarget: targets => {
        return (
          this.blueprint.followup.getTargets(this.game, this)[targets.length] ?? null
        );
      },
      canCommit: this.blueprint.followup.canCommit,
      onComplete
    });
  }

  play() {
    assert(this.hasEnoughMana, new NotEnoughManaError());
    this.selectTargets(this.playWithTargets.bind(this));
  }

  playWithTargets(targets: SelectedTarget[]) {
    const points = targets.map(t => t.cell);

    const [summonPosition] = points;
    this.unit = this.game.unitSystem.addUnit(this, summonPosition);

    const onLeavueBoardCleanups = [
      UNIT_EVENTS.AFTER_DESTROY,
      UNIT_EVENTS.AFTER_BOUNCE
    ].map(e =>
      this.unit.once(e, () => {
        // @ts-expect-error
        this.unit = undefined;
        onLeavueBoardCleanups.forEach(cleanup => cleanup());
      })
    );

    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: points })
    );

    const aoeShape = this.blueprint.getAoe(this.game, this, points);
    this.unit.addToBoard({
      affectedCells: aoeShape.getCells(points),
      affectedUnits: aoeShape.getUnits(points)
    });

    this.blueprint.onPlay(
      this.game,
      this,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );

    if (this.unit.shouldDeactivateWhenSummoned) {
      this.unit.deactivate();
    }

    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
  }

  canPlayAt(point: Point) {
    const baseValue =
      this.player.units.some(unit => unit.position.isNearby(point)) &&
      !this.game.unitSystem.getUnitAt(point) &&
      !!this.game.boardSystem.getCellAt(point)?.isWalkable;

    return this.interceptors.canPlayAt.getValue(baseValue, { point });
  }

  get baseAtk() {
    return this.blueprint.atk;
  }

  get atk(): number {
    return this.interceptors.atk.getValue(this.blueprint.atk, {});
  }

  get baseMaxHp() {
    return this.blueprint.maxHp;
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, {});
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {});
  }

  get unitType() {
    return this.blueprint.unitType;
  }

  get attackPattern() {
    return new MeleeTargetingStrategy(
      this.game,
      this.unit,
      this.unit.attackTargetType,
      false
    );
  }

  get attackAOEShape() {
    return new PointAOEShape(this.game, this.player);
  }

  get counterattackPattern() {
    return new MeleeTargetingStrategy(
      this.game,
      this.unit,
      this.unit.counterattackTargetType,
      false
    );
  }

  get counterattackAOEShape() {
    return new PointAOEShape(this.game, this.player);
  }

  serialize(): SerializedUnitCard {
    return {
      id: this.id,
      blueprintId: this.blueprint.id,
      name: this.name,
      description: this.description,
      kind: this.kind,
      manaCost: this.manaCost,
      canPlay: this.hasEnoughMana,
      baseAtk: this.baseAtk,
      atk: this.atk,
      rarity: this.rarity,
      baseMaxHp: this.baseMaxHp,
      maxHp: this.maxHp,
      faction: this.faction?.serialize() ?? null,
      setId: this.blueprint.setId,
      unitType: this.unitType,
      elligibleFirstTarget: this.game.boardSystem.cells
        .filter(cell =>
          this.blueprint.followup.getTargets(this.game, this)[0]?.isElligible(cell)
        )
        .map(cell => cell.position.serialize()),
      modifiers: this.modifiers.map(modifier => modifier.serialize())
    };
  }

  forwardListeners() {
    Object.values(CARD_EVENTS).forEach(eventName => {
      this.on(eventName, event => {
        this.game.emit(
          `card.${eventName}`,
          new GameCardEvent({ card: this, event: event as any }) as any
        );
      });
    });
  }
}
