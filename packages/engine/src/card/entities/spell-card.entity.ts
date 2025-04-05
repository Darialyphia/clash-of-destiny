import type { Game } from '../../game/game';
import {
  INTERACTION_STATES,
  type SelectedTarget
} from '../../game/systems/interaction.system';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { SpellBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
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

export type SerializedSpellCard = SerializedCard & {
  kind: typeof CARD_KINDS.SPELL;
  maxTargets: number;
  aoe: {
    cells: string[];
    units: string[];
  } | null;
  range: string[] | null;
};
export type AbilityCardEventMap = CardEventMap;
export type AbilityCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  AbilityCardEventMap,
  AbilityCardInterceptors,
  SpellBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      { ...makeCardInterceptors(), canPlay: new Interceptable() },
      options
    );
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.fulfillsAffinity && this.fulfillsResourceCost,
      this
    );
  }

  get followup() {
    return this.blueprint.getFollowup(this.game, this);
  }

  get followupTargets() {
    return this.followup.getTargets(this.game, this);
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.player,
      getNextTarget: targets => {
        return (
          this.blueprint.getFollowup(this.game, this).getTargets(this.game, this)[
            targets.length
          ] ?? null
        );
      },
      canCommit: this.blueprint.getFollowup(this.game, this).canCommit,
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

    const aoeShape = this.blueprint.getAoe(this.game, this, points);
    this.blueprint.onPlay(
      this.game,
      this,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );

    this.player.cards.sendToDiscardPile(this);
    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
  }

  private getSerializedAoe(): SerializedSpellCard['aoe'] {
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
    const aoeShape = this.blueprint.getAoe(this.game, this, points);

    return {
      cells: aoeShape.getCells(points).map(cell => cell.id),
      units: aoeShape.getUnits(points).map(unit => unit.id)
    };
  }

  serialize(): SerializedSpellCard {
    return {
      id: this.id,
      entityType: 'card' as const,
      blueprintId: this.blueprint.id,
      iconId: this.blueprint.cardIconId,
      kind: this.blueprint.kind,
      affinity: this.blueprint.affinity,
      deckSource: this.deckSource,
      destinyCost: this.destinyCost,
      manaCost: this.manaCost,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.getDescription(this.game, this),
      rarity: this.blueprint.rarity,
      player: this.player.id,
      canPlay: this.player.canPlayCard(this),
      maxTargets: this.followupTargets.length,
      aoe: this.getSerializedAoe(),
      range: this.player.currentlyPlayedCard?.equals(this)
        ? this.blueprint
            .getFollowup(this.game, this)
            .getRange(this.game, this)
            .map(cell => cell.id)
        : null
    };
  }
}
