import type { GameStateEntities } from '@/battle/stores/battle.store';
import { CellViewModel } from '@/board/cell.model';
import { CardViewModel } from '@/card/card.model';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import type { Point } from '@game/shared';

export class UnitViewModel {
  constructor(
    private data: SerializedUnit,
    private entityDictionary: GameStateEntities,
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

  set position(val: Point) {
    this.data.position = val;
  }
  get spriteId() {
    return this.data.spriteId;
  }

  get spriteParts() {
    return this.data.spriteParts;
  }

  getMoveZone() {
    return this.data.moveZone.map(point => {
      return this.entityDictionary[pointToCellId(point.point)] as CellViewModel;
    });
  }

  getHand() {
    return this.data.hand.map(cardId => {
      return this.entityDictionary[cardId] as CardViewModel;
    });
  }

  getDiscardPile() {
    return this.data.discardPile.map(cardId => {
      return this.entityDictionary[cardId] as CardViewModel;
    });
  }
}
