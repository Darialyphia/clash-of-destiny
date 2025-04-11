import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { CardViewModel } from '@/card/card.model';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedArtifact } from '@game/engine/src/player/artifact.entity';
import { objectEntries } from '@game/shared';

export class ArtifactViewModel {
  constructor(
    private data: SerializedArtifact,
    private entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {}

  update(data: SerializedArtifact) {
    this.data = data;
  }

  equals(unit: ArtifactViewModel | SerializedArtifact) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  get durability() {
    return this.data.durability;
  }

  get maxDurability() {
    return this.data.maxDurability;
  }

  getCard() {
    return this.entityDictionary[this.data.card] as CardViewModel;
  }
}
