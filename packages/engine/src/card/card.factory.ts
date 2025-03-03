import { match } from 'ts-pattern';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { AnyCard, CardOptions } from './entities/card.entity';
import { CARD_KINDS } from './card.enums';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  UnitBlueprint,
  AbilityBlueprint,
  QuestBlueprint
} from './card-blueprint';
import { UnitCard } from './entities/unit-card.entity';
import { AbilityCard } from './entities/ability-card.entity';
import { ArtifactCard } from './entities/artifact-card.entity';
import { QuestCard } from './entities/quest-card.entity';

export type GameFactory = <T extends CardBlueprint = CardBlueprint>(
  game: Game,
  player: Player,
  options: CardOptions<T>
) => T extends UnitBlueprint
  ? UnitCard
  : T extends AbilityBlueprint
    ? AbilityCard
    : T extends ArtifactBlueprint
      ? ArtifactCard
      : T extends QuestBlueprint
        ? QuestCard
        : AnyCard;

export const createCard: GameFactory = (game, player, options) => {
  const card = match(options.blueprint.kind)
    .with(CARD_KINDS.UNIT, () => new UnitCard(game, player, options as any))
    .with(CARD_KINDS.ABILITY, () => new AbilityCard(game, player, options as any))
    .with(CARD_KINDS.QUEST, () => new QuestCard(game, player, options as any))
    .with(CARD_KINDS.ARTIFACT, () => new ArtifactCard(game, player, options as any))
    .exhaustive();

  return card as any;
};

export const cardIdFactory = () => {
  let nextId = 0;
  return (blueprintId: string, playerId: string) =>
    `${playerId}_card_${blueprintId}_${nextId++}`;
};
