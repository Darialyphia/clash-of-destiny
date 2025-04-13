import { type Point } from '@game/shared';
import type { Game } from '../../game/game';
import {
  INTERACTION_STATES,
  type SelectedTarget
} from '../../game/systems/interaction.system';
import type { Player } from '../../player/player.entity';
import type { SpellBlueprint, UnitBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS, type UnitKind } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { Interceptable } from '../../utils/interceptable';
import type { Unit } from '../../unit/entities/unit.entity';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';

export type SerializedUnitCard = SerializedCard & {
  kind: typeof CARD_KINDS.UNIT;
  unitKind: UnitKind;
  maxTargets: number;
  aoe: {
    cells: string[];
    units: string[];
  } | null;
  range: string[] | null;
  spriteId: string;
};
export type UnitCardEventMap = CardEventMap;
export type UnitCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
  canPlayAt: Interceptable<boolean, { point: Point }>;
};
export const makeUnitCardInterceptors = (): UnitCardInterceptors => ({
  ...makeCardInterceptors(),
  atk: new Interceptable(),
  maxHp: new Interceptable(),
  canPlayAt: new Interceptable()
});

export type AnyUnitCard = UnitCard<
  SerializedUnitCard,
  UnitCardEventMap,
  UnitCardInterceptors,
  UnitBlueprint
>;

export abstract class UnitCard<
  TSerialized extends SerializedUnitCard,
  TEventMap extends UnitCardEventMap,
  TInterceptors extends UnitCardInterceptors,
  TBlueprint extends UnitBlueprint
> extends Card<TSerialized, TEventMap, TInterceptors, TBlueprint> {
  unit!: Unit;

  constructor(
    game: Game,
    player: Player,
    interceptors: TInterceptors,
    options: CardOptions<SpellBlueprint>
  ) {
    super(game, player, interceptors, options);
  }

  get atk() {
    return this.interceptors.atk.getValue(this.blueprint.atk, {});
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, {});
  }

  abstract get job(): string | null;

  abstract canPlay(): boolean;

  get followup(): ReturnType<TBlueprint['getFollowup']> {
    return this.blueprint.getFollowup(this.game, this as any) as any;
  }

  getAoe(points: Point[]) {
    return this.blueprint.getAoe(this.game, this as any, points);
  }

  get followupTargets(): ReturnType<TBlueprint['getFollowup']>['getTargets'] {
    return this.followup.getTargets(this.game, this as any) as any;
  }

  get attackPattern() {
    return new MeleeTargetingStrategy(this.game, this.unit, {
      type: this.unit.attackTargetType,
      allowCenter: false,
      allowDiagonals: true
    });
  }

  get attackAOEShape() {
    return new PointAOEShape(this.game, this.player);
  }

  get counterattackPattern() {
    return new MeleeTargetingStrategy(this.game, this.unit, {
      type: this.unit.attackTargetType,
      allowCenter: false,
      allowDiagonals: true
    });
  }

  get counterattackAOEShape() {
    return new PointAOEShape(this.game, this.player);
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.player,
      getNextTarget: targets => {
        return this.followup.getTargets(this.game, this as any)[targets.length] ?? null;
      },
      canCommit: this.followup.canCommit,
      onComplete
    });
  }

  protected addToBoard(points: Point[]) {
    const [summonPosition] = points;

    this.unit = this.game.unitSystem.addUnit(this, summonPosition);
    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: points })
    );

    const aoeShape = this.blueprint.getAoe(this.game, this as any, points);
    this.unit.addToBoard({
      affectedCells: aoeShape.getCells(points),
      affectedUnits: aoeShape.getUnits(points)
    });

    this.blueprint.onPlay(
      this.game,
      this as any,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );
  }

  play() {
    this.selectTargets(this.playWithTargets.bind(this));
  }

  protected playWithTargets(targets: SelectedTarget[]) {
    const points = targets.map(t => t.cell);

    this.addToBoard(points);

    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
  }

  protected getSerializedAoe(): SerializedUnitCard['aoe'] {
    if (!this.player.currentlyPlayedCard?.equals(this)) {
      return null;
    }
    if (this.game.interaction.context.state !== INTERACTION_STATES.SELECTING_TARGETS) {
      return null;
    }
    if (!this.game.interaction.context.ctx.nextTargetIntent) {
      return null;
    }
    const targets: SelectedTarget[] = [
      ...this.game.interaction.context.ctx.selectedTargets,
      this.game.interaction.context.ctx.nextTargetIntent
    ];
    const canCommit = this.game.interaction.context.ctx.canCommit(targets);
    if (!canCommit) {
      return null;
    }
    const points = targets.map(t => t.cell);
    const aoeShape = this.getAoe(points);

    return {
      cells: aoeShape.getCells(points).map(cell => cell.id),
      units: aoeShape.getUnits(points).map(unit => unit.id)
    };
  }

  canPlayAt(point: Point) {
    const baseValue =
      this.player.hero.position.isNearby(point) &&
      !this.game.unitSystem.getUnitAt(point) &&
      !!this.game.boardSystem.getCellAt(point)?.isWalkable;

    return this.interceptors.canPlayAt.getValue(baseValue, { point });
  }

  protected serializeBase(): SerializedUnitCard {
    const targets = this.followup.getTargets(this.game, this as any);
    return {
      id: this.id,
      entityType: 'card' as const,
      unitKind: this.blueprint.unitKind,
      affinity: this.blueprint.affinity,
      blueprintId: this.blueprint.id,
      iconId: this.blueprint.cardIconId,
      spriteId: this.blueprint.spriteId,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.getDescription(this.game, this as any),
      rarity: this.blueprint.rarity,
      player: this.player.id,
      manaCost: this.manaCost,
      destinyCost: this.destinyCost,
      deckSource: this.deckSource,
      canPlay: this.player.canPlayCard(this),
      maxTargets: targets.length,
      modifiers: this.modifiers.map(modifier => modifier.id),
      aoe: this.getSerializedAoe(),
      range:
        this.player.currentlyPlayedCard?.equals(this) &&
        this.game.interaction.context.state === INTERACTION_STATES.SELECTING_TARGETS
          ? this.blueprint
              .getFollowup(this.game, this as any)
              .getRange(
                this.game,
                this as any,
                this.game.interaction.context.ctx.selectedTargets
              )
              .map(cell => cell.id)
          : null,
      abilities: this.abilities.map(ability => ({
        id: ability.id,
        manaCost: ability.manaCost,
        label: ability.label,
        text: ability.getDescription(this.game, this),
        canUse: this.canUseAbiliy(ability.id),
        isCardAbility: ability.isCardAbility
      }))
    };
  }

  abstract serialize(): TSerialized;
}
