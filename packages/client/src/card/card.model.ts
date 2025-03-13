import type { GameStateEntities } from '@/battle/stores/battle.store';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import type { SerializedAbilityCard } from '@game/engine/src/card/entities/ability-card.entity';
import type { SerializedArtifactCard } from '@game/engine/src/card/entities/artifact-card.entity';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import { match } from 'ts-pattern';

export class CardViewModel {
  constructor(
    private data: SerializedCard,
    private entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: CardViewModel | SerializedCard) {
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

  get kind() {
    return this.data.kind;
  }

  get manaCost() {
    if ('manaCost' in this.data) {
      return this.data.manaCost as number;
    }
  }

  get levelCost() {
    if ('levelCost' in this.data) {
      return this.data.levelCost as number;
    }
  }

  get exp() {
    if ('exp' in this.data) {
      return this.data.exp as number;
    }
  }

  get canPlay() {
    return this.data.canPlay;
  }
}
