import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedModifier } from '@game/engine/src/modifier/modifier.entity';

export class ModifierViewModel {
  constructor(
    private data: SerializedModifier,
    private entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: ModifierViewModel | SerializedModifier) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }
}
