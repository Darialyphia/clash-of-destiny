import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { CellViewModel } from '@/board/cell.model';
import type { UnitViewModel } from '@/unit/unit.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import type { SerializedAbilityCard } from '@game/engine/src/card/entities/ability-card.entity';
import type { SerializedArtifactCard } from '@game/engine/src/card/entities/artifact-card.entity';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { SerializedQuestCard } from '@game/engine/src/card/entities/quest-card.entity';
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

  get rarity() {
    return this.data.rarity;
  }

  get allowedJobs() {
    if ('allowedJobs' in this.data) {
      return this.data.allowedJobs as Array<{ id: string; name: string }>;
    }
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

  get durability() {
    if ('durability' in this.data) {
      return this.data.durability as number;
    }
  }

  get canPlay() {
    return this.data.canPlay;
  }

  getUnit() {
    return this.entityDictionary[this.data.unit] as UnitViewModel;
  }

  get needsTargets() {
    const data = this.data as
      | SerializedAbilityCard
      | SerializedArtifactCard
      | SerializedQuestCard;
    return match(data)
      .with({ kind: CARD_KINDS.ABILITY }, data => {
        return !!data.elligibleFirstTargets.length;
      })
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return false;
      })
      .with({ kind: CARD_KINDS.QUEST }, () => {
        return false;
      })
      .exhaustive();
  }

  get maxTargets() {
    const data = this.data as
      | SerializedAbilityCard
      | SerializedArtifactCard
      | SerializedQuestCard;
    return match(data)
      .with({ kind: CARD_KINDS.ABILITY }, data => {
        return data.maxTargets;
      })
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return 0;
      })
      .with({ kind: CARD_KINDS.QUEST }, () => {
        return 0;
      })
      .exhaustive();
  }

  canPlayAt(cell: CellViewModel) {
    const data = this.data as
      | SerializedAbilityCard
      | SerializedArtifactCard
      | SerializedQuestCard;
    return match(data)
      .with({ kind: CARD_KINDS.ABILITY }, data => {
        if (!data.elligibleFirstTargets.length) return true; // card has no followup

        return data.elligibleFirstTargets.some(id => id === cell.id);
      })
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return cell.getUnit() === this.getUnit();
      })
      .with({ kind: CARD_KINDS.QUEST }, () => {
        return true;
      })
      .exhaustive();
  }

  getAoe() {
    const data = this.data as
      | SerializedAbilityCard
      | SerializedArtifactCard
      | SerializedQuestCard;
    return match(data)
      .with({ kind: CARD_KINDS.ABILITY }, data => {
        return {
          cells:
            data.aoe?.cells.map(
              id => this.entityDictionary[id] as CellViewModel
            ) ?? [],
          units:
            data.aoe?.units.map(
              id => this.entityDictionary[id] as UnitViewModel
            ) ?? []
        };
      })
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return { cells: [], units: [] };
      })
      .with({ kind: CARD_KINDS.QUEST }, () => {
        return { cells: [], units: [] };
      })
      .exhaustive();
  }

  getRange() {
    const data = this.data as
      | SerializedAbilityCard
      | SerializedArtifactCard
      | SerializedQuestCard;
    return match(data)
      .with({ kind: CARD_KINDS.ABILITY }, data => {
        return (
          data.range?.map(id => this.entityDictionary[id] as CellViewModel) ??
          []
        );
      })
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return [];
      })
      .with({ kind: CARD_KINDS.QUEST }, () => {
        return [];
      })
      .exhaustive();
  }

  play() {
    const unit = this.getUnit();
    const hand = unit.getHand();
    const index = hand.findIndex(card => card.equals(this));
    if (index === -1) return;
    unit.playCard(index);
  }
}
