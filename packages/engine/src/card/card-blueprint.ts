import type { Point } from '@game/shared';
import type { AOEShape } from '../aoe/aoe-shapes';
import type { Cell } from '../board/cell';
import type { Game } from '../game/game';
import type { EffectTarget, SelectedTarget } from '../game/systems/interaction.system';
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

export type CardBlueprintBase = {
  id: string;
  name: string;
  setId: CardSetId;
  description: string;
  rarity: Rarity;
};

export type HeroBlueprint = {
  unitKind: typeof UNIT_KINDS.HERO;
} & (
  | {
      level: 1;
      previousClass: null;
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
  maxHp: number;
  initiative: number;
  getAoe(game: Game, card: Unit, points: Point[]): AOEShape;
  onPlay(game: Game, card: Unit): void;
} & (HeroBlueprint | { unitKind: typeof UNIT_KINDS.MINION });

export type AbilityBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ABILITY>;
  manaCost: number;
  exp: number;
  followup: {
    getTargets(game: Game, card: AbilityCard): EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
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
  manaCost: number;
  artifactKind: ArtifactKind;
  onPlay(game: Game, card: ArtifactCard, artifact: Artifact): void;
};

export type QuestBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.QUEST>;
  onPlay(game: Game, card: QuestCard): void;
  onCompleted(game: Game, card: QuestCard): void;
};

export type CardBlueprint =
  | UnitBlueprint
  | AbilityBlueprint
  | ArtifactBlueprint
  | QuestBlueprint;
