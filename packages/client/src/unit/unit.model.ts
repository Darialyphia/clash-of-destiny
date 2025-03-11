import { CellViewModel } from '@/board/cell.model';
import { CardViewModel } from '@/card/card.model';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { EntityDictionary } from '@game/engine/src/game/systems/game-snapshot.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';

export class UnitViewModel {
  constructor(
    private data: SerializedUnit,
    private entityDictionary: EntityDictionary,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  get playerId() {
    return this.data.playerId;
  }

  get position() {
    return this.data.position;
  }

  get spriteId() {
    return this.data.spriteId;
  }

  get spriteParts() {
    return this.data.spriteParts;
  }

  getMoveZone() {
    return this.data.moveZone.map(point => {
      const cell = this.entityDictionary[pointToCellId(point)];

      if (cell.entityType !== 'cell') {
        throw new Error('Expected cell');
      }

      return new CellViewModel(cell, this.entityDictionary, this.dispatcher);
    });
  }

  getHand() {
    return this.data.hand.map(cardId => {
      const card = this.entityDictionary[cardId];

      if (card.entityType !== 'card') {
        throw new Error('Expected card');
      }

      return new CardViewModel(card, this.entityDictionary, this.dispatcher);
    });
  }

  getDiscardPile() {
    return this.data.discardPile.map(cardId => {
      const card = this.entityDictionary[cardId];

      if (card.entityType !== 'card') {
        throw new Error('Expected card');
      }

      return new CardViewModel(card, this.entityDictionary, this.dispatcher);
    });
  }
}
