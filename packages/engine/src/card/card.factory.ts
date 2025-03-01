import { match } from 'ts-pattern';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { AnyCard, CardOptions } from './entities/card.entity';
import { CARD_KINDS } from './card.enums';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  SpellBlueprint,
  UnitBlueprint
} from './card-blueprint';
import { UnitCard } from './entities/unit-card.entity';
import { SpellCard } from './entities/spell-card.entity';
import { ArtifactCard } from './entities/artifact-card.entity';

export type GameFactory = <T extends CardBlueprint = CardBlueprint>(
  game: Game,
  player: Player,
  options: CardOptions
) => T extends UnitBlueprint
  ? UnitCard
  : T extends SpellBlueprint
    ? SpellCard
    : T extends ArtifactBlueprint
      ? ArtifactCard
      : AnyCard;

export const createCard: GameFactory = (
  game: Game,
  player: Player,
  options: CardOptions
) => {
  const card = match(options.blueprint.kind)
    .with(CARD_KINDS.UNIT, () => new UnitCard(game, player, options))
    .with(CARD_KINDS.SPELL, () => new SpellCard(game, player, options))
    .with(CARD_KINDS.ARTIFACT, () => new ArtifactCard(game, player, options))
    .exhaustive();

  return card as any;
};

export const cardIdFactory = () => {
  let nextId = 0;
  return (blueprintId: string, playerId: string) =>
    `${playerId}_card_${blueprintId}_${nextId++}`;
};
