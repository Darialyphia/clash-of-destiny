import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedModifier } from '@game/engine/src/modifier/modifier.entity';
import type { UnitViewModel } from './unit.model';
import type { CardViewModel } from '@/card/card.model';
import type { ArtifactViewModel } from './artifact.model';

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

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get icon() {
    return this.data.icon;
  }

  get targetAsUnit() {
    return this.entityDictionary[this.data.target] as UnitViewModel;
  }

  get targetAsCard() {
    return this.entityDictionary[this.data.target] as CardViewModel;
  }

  get targetAsArtifact() {
    return this.entityDictionary[this.data.target] as ArtifactViewModel;
  }
}
