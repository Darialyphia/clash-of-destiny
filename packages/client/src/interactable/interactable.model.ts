import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedInteractable } from '@game/engine/src/interactable/interactable.entity';
import { objectEntries } from '@game/shared';

export class InteractableViewModel {
  private getEntities: () => GameStateEntities;

  constructor(
    private data: SerializedInteractable,
    entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {
    this.getEntities = () => entityDictionary;
  }

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
