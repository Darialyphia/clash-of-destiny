import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { CellViewModel } from '@/board/cell.model';
import type { PlayerViewModel } from '@/player/player.model';
import type { UnitViewModel } from '@/unit/unit.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import type { SerializedArtifactCard } from '@game/engine/src/card/entities/artifact-card.entity';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { SerializedHeroCard } from '@game/engine/src/card/entities/hero-card.entity';
import type { SerializedMinionCard } from '@game/engine/src/card/entities/minion-card.entity';
import type { SerializedSecretCard } from '@game/engine/src/card/entities/secret-card.entity';
import type { SerializedShrineCard } from '@game/engine/src/card/entities/shrine-card.entity';
import type { SerializedSpellCard } from '@game/engine/src/card/entities/spell-card.entity';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import { match } from 'ts-pattern';

type CardData =
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedHeroCard
  | SerializedShrineCard
  | SerializedMinionCard
  | SerializedSecretCard;

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

  getPlayer() {
    return this.entityDictionary[this.data.player] as PlayerViewModel;
  }

  get needsTargets() {
    return true;
  }

  get maxTargets() {
    const data = this.data as CardData;

    return match(data)
      .with(
        { kind: CARD_KINDS.UNIT },
        { kind: CARD_KINDS.SPELL },
        { kind: CARD_KINDS.SECRET },
        data => {
          return data.maxTargets;
        }
      )
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return { cells: [], units: [] };
      })
      .exhaustive();
  }

  getAoe() {
    const data = this.data as CardData;

    return match(data)
      .with(
        { kind: CARD_KINDS.UNIT },
        { kind: CARD_KINDS.SPELL },
        { kind: CARD_KINDS.SECRET },
        data => {
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
        }
      )
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return { cells: [], units: [] };
      })
      .exhaustive();
  }

  getRange() {
    const data = this.data as CardData;
    return match(data)
      .with(
        { kind: CARD_KINDS.UNIT },
        { kind: CARD_KINDS.SPELL },
        { kind: CARD_KINDS.SECRET },
        data => {
          return (
            data.range?.map(id => this.entityDictionary[id] as CellViewModel) ??
            []
          );
        }
      )
      .with({ kind: CARD_KINDS.ARTIFACT }, () => {
        return [];
      })
      .exhaustive();
  }

  play() {
    const unit = this.getPlayer();
    const hand = unit.getHand();
    const index = hand.findIndex(card => card.equals(this));
    if (index === -1) return;
    unit.playCard(index);
  }
}
