import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import type { AbilityBlueprint, StatusEffectBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedStatusEffectCard = SerializedCard & {
  kind: typeof CARD_KINDS.STATUS;
};
export type StatusEffectCardEventMap = CardEventMap;
export type StatusEffectCardInterceptors = Record<string, never>;

export class StatusEffectCard extends Card<
  SerializedCard,
  StatusEffectCardEventMap,
  StatusEffectCardInterceptors,
  StatusEffectBlueprint
> {
  constructor(game: Game, unit: Unit, options: CardOptions<AbilityBlueprint>) {
    super(game, unit, {}, options);
  }

  canPlay(): boolean {
    return true;
  }

  play() {
    this.emitter.emit(CARD_EVENTS.BEFORE_PLAY, new CardBeforePlayEvent({ targets: [] }));

    this.blueprint.onPlay(this.game, this);

    this.emitter.emit(CARD_EVENTS.AFTER_PLAY, new CardAfterPlayEvent({ targets: [] }));
  }

  serialize(): SerializedStatusEffectCard {
    return {
      id: this.id,
      entityType: 'card' as const,
      blueprintId: this.blueprint.id,
      iconId: this.blueprint.cardIconId,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.getDescription(this.game, this),
      rarity: this.blueprint.rarity,
      unit: this.unit.id,
      canPlay: this.canPlay()
    };
  }
}
