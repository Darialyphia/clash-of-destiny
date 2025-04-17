import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { JoinedFollowup } from '../../followups/joined-followup';
import { Position } from '../../../utils/position.component';
import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { playfulEels } from './playful-eels';
import { floatingDestiny } from '../../abilities/floating-destiny';

export const shoalOfEels: SpellBlueprint = {
  id: 'shoal-of-eels',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.WATER,
  name: 'Shoal of Eels',
  getDescription: () => {
    return `Summon  @[spellpower]@ + 2 joined @Playful Eels@.`;
  },
  staticDescription: `Summon @[spellpower]@ + 2 joined @Playful Eels@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-shoal-of-eels',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SUMMONER,
  abilities: [floatingDestiny],
  getFollowup: (game, card) => {
    return new JoinedFollowup({
      max: card.player.hero.spellpower + 2,
      originTargetingStrategy: {
        canTargetAt(point) {
          const position = Position.fromPoint(point);
          return card.player.units.some(unit => {
            return game.boardSystem
              .getNeighbors(unit.position)
              .some(cell => position.equals(cell) && cell.isWalkable && !cell.unit);
          });
        },
        isWithinRange(point) {
          const position = Position.fromPoint(point);
          return card.player.units.some(unit => {
            return game.boardSystem
              .getNeighbors(unit.position)
              .some(cell => position.equals(cell) && cell.isWalkable && !cell.unit);
          });
        }
      }
    });
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT),
        getPoints(points) {
          return [points[0]];
        }
      },
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT),
        getPoints(points) {
          return [points[1]];
        }
      },
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT),
        getPoints(points) {
          return [points[2]];
        }
      }
    ]);
  },
  onInit() {},
  onPlay(game, card, affectedCells) {
    affectedCells.forEach(cell => {
      card.player.summonMinionFromBlueprint(playfulEels.id, cell);
    });
  }
};
