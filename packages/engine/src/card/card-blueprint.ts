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
  UNIT_KINDS,
  CARD_DECK_SOURCES,
  CardJob
} from './card.enums';
import type { SpellCard } from './entities/spell-card.entity';
import type { Artifact } from '../player/artifact.entity';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { Followup } from './followups/ability-followup';
import type { AnyCard } from './entities/card.entity';
import type { EffectTarget, SelectedTarget } from '../game/systems/interaction.system';
import type { ShrineCard } from './entities/shrine-card.entity';
import type { HeroCard } from './entities/hero-card.entity';
import type { MinionCard } from './entities/minion-card.entity';
import type { SecretCard } from './entities/secret-card.entity';

export type CardBlueprintBase = {
  id: string;
  name: string;
  setId: CardSetId;
  rarity: Rarity;
  cardIconId: string;
  collectable: boolean;
};

export type MainDeckCardBlueprint = CardBlueprintBase & {
  manaCost: number;
  deckSource: typeof CARD_DECK_SOURCES.MAIN_DECK;
};

export type DestinyDeckCardBlueprint = CardBlueprintBase & {
  destinyCost: number;
  deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
};

export type Ability<T extends AnyCard> = {
  manaCost: number;
  shouldExhaust: boolean;
  staticDescription: string;
  label: string;
  getDescription(game: Game, card: T): string;
  getFollowup(
    game: Game,
    card: T
  ): {
    targets: EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
  onResolve: <TTarget extends SelectedTarget>(
    game: Game,
    card: T,
    targets: TTarget[]
  ) => void;
};

export type HeroBlueprint = {
  unitKind: typeof UNIT_KINDS.HERO;
  level: 1 | 2 | 3;
  lineage: string;
  atk: number;
  abilities: Array<Ability<HeroCard>>;
  spellpower: number;
  getDescription(game: Game, card: HeroCard): string;
  getFollowup(game: Game, card: HeroCard): Followup<HeroCard>;
  getAoe(game: Game, card: HeroCard, points: Point[]): AOEShape;
  onPlay(game: Game, card: HeroCard, affectedCells: Cell[], affectedUnits: Unit[]): void;
};

export type ShrineBlueprint = {
  unitKind: typeof UNIT_KINDS.SHRINE;
  abilities: Array<Ability<ShrineCard>>;
  level: 0;
  atk: number;
  getDescription(game: Game, card: ShrineCard): string;
  getFollowup(game: Game, card: HeroCard): Followup<ShrineCard>;
  getAoe(game: Game, card: ShrineCard, points: Point[]): AOEShape;
  onPlay(
    game: Game,
    card: ShrineCard,
    affectedCells: Cell[],
    affectedUnits: Unit[]
  ): void;
};

export type MinionBlueprint = {
  unitKind: typeof UNIT_KINDS.MINION;
  abilities: Array<Ability<MinionCard>>;
  atk: number;
  getDescription(game: Game, card: MinionCard): string;
  getFollowup(game: Game, card: MinionCard): Followup<MinionCard>;
  getAoe(game: Game, card: MinionCard, points: Point[]): AOEShape;
  onPlay(
    game: Game,
    card: MinionCard,
    affectedCells: Cell[],
    affectedUnits: Unit[]
  ): void;
};

export type UnitBlueprint = (MainDeckCardBlueprint | DestinyDeckCardBlueprint) & {
  kind: Extract<CardKind, typeof CARD_KINDS.UNIT>;
  staticDescription: string;
  maxHp: number;
  spriteId: string;
  iconId: string;
  spriteParts: Record<string, string>;
  job: CardJob;
} & (HeroBlueprint | MinionBlueprint | ShrineBlueprint);

export type SpellBlueprint = (MainDeckCardBlueprint | DestinyDeckCardBlueprint) & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  getDescription(game: Game, card: SpellCard): string;
  staticDescription: string;
  job: CardJob;
  getFollowup(game: Game, card: SpellCard): Followup<SpellCard>;
  getAoe(game: Game, card: SpellCard, points: Point[]): AOEShape;
  onPlay(game: Game, card: SpellCard, affectedCells: Cell[], affectedUnits: Unit[]): void;
};

export type ArtifactBlueprint = (MainDeckCardBlueprint | DestinyDeckCardBlueprint) & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  getDescription(game: Game, card: ArtifactCard): string;
  staticDescription: string;
  durability: number;
  artifactKind: ArtifactKind;
  abilities: Array<Ability<ArtifactCard>>;
  getFollowup(game: Game, card: SpellCard): Followup<ArtifactCard>;
  onPlay(game: Game, card: ArtifactCard, artifact: Artifact): void;
};

export type SecretBlueprint = (MainDeckCardBlueprint | DestinyDeckCardBlueprint) & {
  kind: Extract<CardKind, typeof CARD_KINDS.SECRET>;
  getDescription(game: Game, card: SecretCard): string;
  staticDescription: string;
  getFollowup(game: Game, card: SecretCard): Followup<SecretCard>;
  getAoe(game: Game, card: SecretCard, points: Point[]): AOEShape;
  onPlay(
    game: Game,
    card: SecretCard,
    affectedCells: Cell[],
    affectedUnits: Unit[]
  ): void;
};

export type CardBlueprint =
  | UnitBlueprint
  | SpellBlueprint
  | ArtifactBlueprint
  | SecretBlueprint;
