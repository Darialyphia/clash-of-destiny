import type { EntityDictionary } from '@game/engine/src/game/systems/game-snapshot.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedModifier } from '@game/engine/src/modifier/modifier.entity';

export class ModifierViewModel {
  constructor(
    private data: SerializedModifier,
    private entityDictionary: EntityDictionary,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: ModifierViewModel | SerializedModifier) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }
}
