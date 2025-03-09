import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import type { QuestBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedQuestCard = SerializedCard & { kind: typeof CARD_KINDS.QUEST };
export type QuestCardEventMap = CardEventMap;
export type QuestCardInterceptors = Record<string, never>;

export class QuestCard extends Card<
  SerializedCard,
  QuestCardEventMap,
  QuestCardInterceptors,
  QuestBlueprint
> {
  constructor(game: Game, unit: Unit, options: CardOptions<QuestBlueprint>) {
    super(game, unit, {}, options);
  }

  canPlay(): boolean {
    return true;
  }

  play() {
    this.emitter.emit(CARD_EVENTS.BEFORE_PLAY, new CardBeforePlayEvent({ targets: [] }));
    this.blueprint.onPlay(this.game, this);
    this.unit.quests.start(this);
    this.emitter.emit(CARD_EVENTS.AFTER_PLAY, new CardAfterPlayEvent({ targets: [] }));
  }

  complete() {
    this.blueprint.onCompleted(this.game, this);
    this.unit.quests.complete(this);
  }

  get manaCost() {
    return 0;
  }

  serialize(): SerializedQuestCard {
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
