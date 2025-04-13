import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedModifier } from '@game/engine/src/modifier/modifier.entity';
import type { UnitViewModel } from './unit.model';
import type { CardViewModel } from '@/card/card.model';
import type { ArtifactViewModel } from './artifact.model';
import { objectEntries } from '@game/shared';

export class ModifierViewModel {
  private getEntities: () => GameStateEntities;

  constructor(
    private data: SerializedModifier,
    entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {
    this.getEntities = () => entityDictionary;
  }

  equals(unit: ModifierViewModel | SerializedModifier) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  get modifierType() {
    return this.data.modifierType;
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

  get stacks() {
    return this.data.stacks;
  }

  get targetAsUnit() {
    return this.getEntities()[this.data.target] as UnitViewModel;
  }

  get targetAsCard() {
    return this.getEntities()[this.data.target] as CardViewModel;
  }

  get targetAsArtifact() {
    return this.getEntities()[this.data.target] as ArtifactViewModel;
  }
}
