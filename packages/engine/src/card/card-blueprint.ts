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
  UnitKind
} from './card.enums';
import type { AbilityCard } from './entities/ability-card.entity';

export type CardBlueprintBase = {
  id: string;
  name: string;
  setId: CardSetId;
  description: string;
  rarity: Rarity;
};

export type UnitBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.UNIT>;
  unitKind: UnitKind;
  maxHp: number;
  initiative: number;
};

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
};

export type QuestBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.QUEST>;
};

export type CardBlueprint =
  | UnitBlueprint
  | AbilityBlueprint
  | ArtifactBlueprint
  | QuestBlueprint;
