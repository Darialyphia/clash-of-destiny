import type { Game } from '../game/game';
import type { EffectTarget, SelectedTarget } from '../game/systems/interaction.system';
import type { Keyword } from './card-keyword';
import type { CARD_KINDS, CardKind, CardSetId, Rarity, UnitType } from './card.enums';
import type { AnyCard } from './entities/card.entity';
import { UnitCard } from './entities/unit-card.entity';
import { SpellCard } from './entities/spell-card.entity';
import type { Faction } from './entities/faction.entity';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { Point } from '@game/shared';
import type { AOEShape } from '../aoe/aoe-shapes';
import type { Cell } from '../board/cell';
import type { Unit } from '../unit/entities/unit.entity';
import type { PlayerArtifact } from '../player/player-artifact.entity';

export type CardBlueprintBase = {
  id: string;
  name: string;
  setId: CardSetId;
  description: string;
  manaCost: number;
  faction: Faction | null;
  rarity: Rarity;
};

export type Ability<T extends AnyCard> = {
  manaCost: number;
  followup: {
    targets: EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
  getAoe: (game: Game, card: UnitCard, points: Point[]) => AOEShape;
  onResolve: (game: Game, card: T, targets: SelectedTarget[]) => void;
};

export type UnitBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.UNIT>;
  keywords: Keyword[];
  maxHp: number;
  atk: number;
  abilities: Array<Ability<UnitCard>>;
  unitType: UnitType;
  followup: {
    getTargets(game: Game, card: UnitCard): EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
  getAoe: (game: Game, card: UnitCard, points: Point[]) => AOEShape;
  onInit(game: Game, card: UnitCard): void;
  onPlay(game: Game, card: UnitCard, affectedCells: Cell[], affectedUnits: Unit[]): void;
};

export type SpellBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  followup: {
    getTargets(game: Game, card: SpellCard): EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
  getAoe: (game: Game, card: SpellCard, points: Point[]) => AOEShape;
  onInit(game: Game, card: SpellCard): void;
  onPlay(game: Game, card: SpellCard, affectedCells: Cell[], affectedUnits: Unit[]): void;
};

export type ArtifactBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  durability: number;
  followup: {
    getTargets(game: Game, card: ArtifactCard): EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
  getAoe: (game: Game, card: ArtifactCard, points: Point[]) => AOEShape;
  onInit(game: Game, card: ArtifactCard): void;
  onPlay(
    game: Game,
    card: ArtifactCard,
    artifact: PlayerArtifact,
    affectedCells: Cell[],
    affectedUnits: Unit[]
  ): void;
};

export type CardBlueprint = UnitBlueprint | SpellBlueprint | ArtifactBlueprint;
