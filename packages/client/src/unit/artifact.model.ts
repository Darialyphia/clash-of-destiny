import { CardViewModel } from '@/card/card.model';
import type { EntityDictionary } from '@game/engine/src/game/systems/game-snapshot.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedArtifact } from '@game/engine/src/unit/entities/artifact.entity';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';

export class ArtifactViewModel {
  constructor(
    private data: SerializedArtifact,
    private entityDictionary: EntityDictionary,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: ArtifactViewModel | SerializedArtifact) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }
}
