import type { Game } from '../../game/game';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import type { AbilityBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedAbilityCard = SerializedCard & { kind: typeof CARD_KINDS.ABILITY };
export type AbilityCardEventMap = CardEventMap;
export type AbilityCardInterceptors = Record<string, never>;

export class AbilityCard extends Card<
  SerializedCard,
  AbilityCardEventMap,
  AbilityCardInterceptors,
  AbilityBlueprint
> {
  constructor(game: Game, unit: Unit, options: CardOptions<AbilityBlueprint>) {
    super(game, unit, {}, options);
  }

  canPlay(): boolean {
    return this.manaCost <= this.unit.mp;
  }

  get exp() {
    return this.blueprint.exp;
  }

  get manaCost() {
    return this.blueprint.manaCost;
  }

  get followupTargets() {
    return this.blueprint.followup.getTargets(this.game, this);
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.unit.player,
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

    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
  }

  serialize(): SerializedAbilityCard {
    return {
      id: this.id,
      blueprintId: this.blueprint.id,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.description,
      rarity: this.blueprint.rarity
    };
  }
}
