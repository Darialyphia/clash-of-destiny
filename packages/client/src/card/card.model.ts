import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { EntityDictionary } from '@game/engine/src/game/systems/game-snapshot.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';

export class CardViewModel {
  constructor(
    private data: SerializedCard,
    private entityDictionary: EntityDictionary,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: CardViewModel | SerializedCard) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }
}
