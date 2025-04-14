import { NoAOEShape } from '../../../aoe/no-aoe.aoe-shape';
import type { SpellBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';
import { bubblySlime } from './bubbly-slime';

export const slimesToTheRescue: SpellBlueprint = {
  id: 'slimes-to-the-rescue',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.NORMAL,
  name: 'Slimes, to the Rescue!',
  getDescription: () => {
    return `If your opponent controls at least 2 more minions than you, summon a @Bubbly Slime@ above and below your Hero.`;
  },
  staticDescription: `If your opponent controls at least 2 more minions than you, summon a @Bubbly Slime@ above and below your Hero.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-slime-to-the-rescue',
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.SUMMONER,
  abilities: [],
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe() {
    return new NoAOEShape();
  },
  onInit() {},
  onPlay(game, card) {
    const ownMinions = card.player.units.filter(u => u.isMinion);
    const opponentMinions = card.player.opponent.units.filter(u => u.isMinion);

    if (opponentMinions.length >= ownMinions.length + 2) {
      const player = card.player;
      const heroCell = player.hero.position;
      const aboveCell = game.boardSystem.getCellAt({ x: heroCell.x, y: heroCell.y - 1 });
      const belowCell = game.boardSystem.getCellAt({ x: heroCell.x, y: heroCell.y + 1 });

      if (aboveCell) {
        card.player.summonMinionFromBlueprint(bubblySlime.id, aboveCell);
      }
      if (belowCell) {
        card.player.summonMinionFromBlueprint(bubblySlime.id, belowCell);
      }
    }
  }
};
