import type { QuestCard } from '../../card/entities/quest-card.entity';

export class QuestManagerComponent {
  private _ongoingQuests = new Set<QuestCard>();

  start(card: QuestCard) {
    this._ongoingQuests.add(card);
  }

  complete(card: QuestCard) {
    this._ongoingQuests.delete(card);
  }
}
