import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { CellViewModel } from '@/board/cell.model';
import type { UnitViewModel } from '@/unit/unit.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import type { SerializedAbilityCard } from '@game/engine/src/card/entities/ability-card.entity';
import type { SerializedArtifactCard } from '@game/engine/src/card/entities/artifact-card.entity';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { SerializedQuestCard } from '@game/engine/src/card/entities/quest-card.entity';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedInteractable } from '@game/engine/src/interactable/interactable.entity';
import { match } from 'ts-pattern';

export class InteractableViewModel {
  constructor(
    private data: SerializedInteractable,
    private entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: InteractableViewModel | SerializedInteractable) {
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

  get imagePath() {
    return `/assets/icons/${this.data.iconId}.png`;
  }

  get spriteId() {
    return this.data.spriteId;
  }

  get position() {
    return this.data.position;
  }
}
