import type { Game } from '../game/game';
import type { EffectTarget, SelectedTarget } from '../game/systems/interaction.system';
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
  followup: {
    getTargets(game: Game, card: AbilityCard): EffectTarget[];
    canCommit: (targets: SelectedTarget[]) => boolean;
  };
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
