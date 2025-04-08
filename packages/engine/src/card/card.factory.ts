import { match } from 'ts-pattern';
import type { Game } from '../game/game';
import type { CardOptions } from './entities/card.entity';
import { CARD_KINDS, UNIT_KINDS } from './card.enums';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  SecretBlueprint,
  SpellBlueprint,
  UnitBlueprint
} from './card-blueprint';
import { SpellCard } from './entities/spell-card.entity';
import { ArtifactCard } from './entities/artifact-card.entity';
import { SecretCard } from './entities/secret-card.entity';
import { MinionCard } from './entities/minion-card.entity';
import { HeroCard } from './entities/hero-card.entity';
import { ShrineCard } from './entities/shrine-card.entity';
import type { Player } from '../player/player.entity';

export type GameFactory = <T extends CardBlueprint = CardBlueprint>(
  game: Game,
  player: Player,
  options: CardOptions<T>
) => T extends SpellBlueprint
  ? SpellCard
  : T extends ArtifactBlueprint
    ? ArtifactCard
    : T extends SecretBlueprint
      ? SecretCard
      : T extends UnitBlueprint
        ? T['unitKind'] extends typeof UNIT_KINDS.MINION
          ? MinionCard
          : T['unitKind'] extends typeof UNIT_KINDS.HERO
            ? HeroCard
            : T['unitKind'] extends typeof UNIT_KINDS.SHRINE
              ? ShrineCard
              : never
        : never;

export const createCard: GameFactory = (game, unit, options) => {
  const card = match(options.blueprint.kind)
    .with(CARD_KINDS.SPELL, () => new SpellCard(game, unit, options as any))
    .with(CARD_KINDS.UNIT, () => {
      const blueprint = options.blueprint as UnitBlueprint;
      if (blueprint.unitKind === UNIT_KINDS.MINION) {
        return new MinionCard(game, unit, options as any);
      } else if (blueprint.unitKind === UNIT_KINDS.HERO) {
        return new HeroCard(game, unit, options as any);
      } else {
        return new ShrineCard(game, unit, options as any);
      }
    })
    .with(CARD_KINDS.ARTIFACT, () => new ArtifactCard(game, unit, options as any))
    .with(CARD_KINDS.SECRET, () => new SecretCard(game, unit, options as any))
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
