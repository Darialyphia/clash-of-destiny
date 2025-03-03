import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import type { QuestBlueprint } from '../card-blueprint';
import { CARD_KINDS } from '../card.enums';
import type { CardEventMap } from '../card.events';
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

  play() {}

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
