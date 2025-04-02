import type { Point } from '@game/shared';
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

export type SerializedUnitCard = SerializedCard & {
  kind: typeof CARD_KINDS.UNIT;
  unitKind: UnitKind;
  maxTargets: number;
  aoe: {
    cells: string[];
    units: string[];
  } | null;
  range: string[] | null;
};
export type UnitCardEventMap = CardEventMap;
export type UnitCardInterceptors = CardInterceptors & {
  atk: Interceptable<number>;
  maxHp: Interceptable<number>;
};
export const makeUnitCardInterceptors = (): UnitCardInterceptors => ({
  ...makeCardInterceptors(),
  atk: new Interceptable(),
  maxHp: new Interceptable()
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

  canPlay(): boolean {
    return true;
  }

  get followup(): ReturnType<TBlueprint['getFollowup']> {
    return this.blueprint.getFollowup(this.game, this as any) as any;
  }

  getAoe(points: Point[]) {
    return this.blueprint.getAoe(this.game, this as any, points);
  }

  get followupTargets(): ReturnType<TBlueprint['getFollowup']>['getTargets'] {
    return this.followup.getTargets(this.game, this as any) as any;
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

  play() {
    this.selectTargets(this.playWithTargets.bind(this));
  }

  playWithTargets(targets: SelectedTarget[]) {
    const points = targets.map(t => t.cell);

    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: points })
    );

    const aoeShape = this.getAoe(points);
    this.blueprint.onPlay(
      this.game,
      this as any,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );

    this.player.cards.sendToDiscardPile(this);
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

  protected serializeBase(): SerializedUnitCard {
    const targets = this.followup.getTargets(this.game, this as any);

    return {
      id: this.id,
      entityType: 'card' as const,
      unitKind: this.blueprint.unitKind,
      blueprintId: this.blueprint.id,
      iconId: this.blueprint.cardIconId,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.getDescription(this.game, this as any),
      rarity: this.blueprint.rarity,
      unit: this.player.id,
      manaCost: this.manaCost,
      destinyCost: this.destinyCost,
      deckSource: this.deckSource,
      canPlay: this.player.canPlayCard(this),
      maxTargets: targets.length,
      aoe: this.getSerializedAoe(),
      range: this.player.currentlyPlayedCard?.equals(this)
        ? this.blueprint
            .getFollowup(this.game, this as any)
            .getRange(this.game, this as any)
            .map(cell => cell.id)
        : null
    };
  }

  abstract serialize(): TSerialized;
}
