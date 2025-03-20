import { match } from 'ts-pattern';
import type { Game } from '../game/game';
import type { AnyCard, CardOptions } from './entities/card.entity';
import { CARD_KINDS } from './card.enums';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  AbilityBlueprint,
  QuestBlueprint,
  StatusEffectBlueprint
} from './card-blueprint';
import { AbilityCard } from './entities/ability-card.entity';
import { ArtifactCard } from './entities/artifact-card.entity';
import { QuestCard } from './entities/quest-card.entity';
import type { Unit } from '../unit/entities/unit.entity';
import { StatusEffectCard } from './entities/status-effect-card';

export type GameFactory = <T extends CardBlueprint = CardBlueprint>(
  game: Game,
  unit: Unit,
  options: CardOptions<T>
) => T extends AbilityBlueprint
  ? AbilityCard
  : T extends ArtifactBlueprint
    ? ArtifactCard
    : T extends QuestBlueprint
      ? QuestCard
      : T extends StatusEffectBlueprint
        ? StatusEffectCard
        : never;

export const createCard: GameFactory = (game, unit, options) => {
  const card = match(options.blueprint.kind)
    .with(CARD_KINDS.ABILITY, () => new AbilityCard(game, unit, options as any))
    .with(CARD_KINDS.QUEST, () => new QuestCard(game, unit, options as any))
    .with(CARD_KINDS.ARTIFACT, () => new ArtifactCard(game, unit, options as any))
    .with(CARD_KINDS.STATUS, () => new StatusEffectCard(game, unit, options as any))
    .otherwise(() => {
      throw new Error(`Unknown card kind: ${options.blueprint.kind}`);
    });

  return card as any;
};

export const cardIdFactory = () => {
  let nextId = 0;
  return (blueprintId: string, playerId: string) =>
    `${playerId}_card_${blueprintId}_${nextId++}`;
};
