import { EverywhereAOEShape } from '../../../aoe/everywhere.aoe-shape';
import { SpellDamage } from '../../../combat/damage';
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
import { AnywhereFollowup } from '../../followups/anywhere-followup';

export const tidalWave: SpellBlueprint = {
  id: 'tidal-wave',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.WATER,
  name: 'Tidal Wave',
  getDescription: () => {
    return `Deal 2 damage to all enemies and knock them back one tile.`;
  },
  staticDescription: `Deal 2 damage to all enemies and knock them back one tile`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-tidal-wave',
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 5,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ANYWHERE });
  },
  getAoe(game, card) {
    return new EverywhereAOEShape(game, card.player, TARGETING_TYPE.ENEMY_UNIT);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const damage = new SpellDamage({ source: card, baseAmount: 2 });
    affectedUnits.forEach(unit => {
      unit.takeDamage(card, damage);
      const destination = {
        x: card.player.isPlayer1 ? unit.position.x + 1 : unit.position.x - 1,
        y: unit.position.y
      };
      const cell = game.boardSystem.getCellAt(destination);
      if (!cell || !cell.isWalkable || cell.unit) {
        return;
      }
      unit.teleport({
        x: card.player.isPlayer1 ? unit.position.x + 1 : unit.position.x - 1,
        y: unit.position.y
      });
    });
  }
};
