import type { Point } from '@game/shared';
import type { AOEShape } from '../aoe/aoe-shapes';
import type { Cell } from '../board/cell';
import type { Game } from '../game/game';
import type { Unit } from '../unit/entities/unit.entity';
import type {
  ArtifactKind,
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  UNIT_KINDS
} from './card.enums';
import type { AbilityCard } from './entities/ability-card.entity';
import type { Artifact } from '../unit/entities/artifact.entity';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { QuestCard } from './entities/quest-card.entity';
import type { AbilityFollowup } from './followups/ability-followup';
import type { StatusEffectCard } from './entities/status-effect-card';

export type CardBlueprintBase = {
  id: string;
  name: string;
  setId: CardSetId;
  rarity: Rarity;
  cardIconId: string;
  collectable: boolean;
};

export type HeroBlueprint = {
  unitKind: typeof UNIT_KINDS.HERO;
} & (
  | {
      level: 1;
      previousClass?: null;
      neededExp?: never;
    }
  | {
      level: 2 | 3;
      previousClass: string;
      neededExp: number;
    }
);

export type UnitBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.UNIT>;
  getDescription(game: Game, unit: Unit): string;
  staticDescription: string;
  maxHp: number;
  initiative: number;
  spriteId: string;
  iconId: string;
  spriteParts: Record<string, string>;
  getAoe(game: Game, unit: Unit, points: Point[]): AOEShape;
  onPlay(game: Game, unit: Unit): void;
} & (HeroBlueprint | { unitKind: typeof UNIT_KINDS.MINION });

export type AbilityBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ABILITY>;
  getDescription(game: Game, card: AbilityCard): string;
  staticDescription: string;
  manaCost: number;
  levelCost: 1 | 2 | 3;
  exp: number;
  classIds: string[];
  getFollowup(game: Game, card: AbilityCard): AbilityFollowup;
  getAoe(game: Game, card: AbilityCard, points: Point[]): AOEShape;
  onPlay(
    game: Game,
    card: AbilityCard,
    affectedCells: Cell[],
    affectedUnits: Unit[]
  ): void;
};

export type ArtifactBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  getDescription(game: Game, card: ArtifactCard): string;
  staticDescription: string;
  durability: number;
  levelCost: 1 | 2 | 3;
  artifactKind: ArtifactKind;
  classIds: string[];
  onPlay(game: Game, card: ArtifactCard, artifact: Artifact): void;
};

export type QuestBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.QUEST>;
  getDescription(game: Game, card: QuestCard): string;
  staticDescription: string;
  levelCost: 1 | 2 | 3;
  classIds: string[];
  onPlay(game: Game, card: QuestCard): void;
  onCompleted(game: Game, card: QuestCard): void;
};

export type StatusEffectBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.STATUS>;
  getDescription(game: Game, card: StatusEffectCard): string;
  staticDescription: string;
  onPlay(game: Game, card: StatusEffectCard): void;
};

export type CardBlueprint =
  | UnitBlueprint
  | AbilityBlueprint
  | ArtifactBlueprint
  | QuestBlueprint
  | StatusEffectBlueprint;
