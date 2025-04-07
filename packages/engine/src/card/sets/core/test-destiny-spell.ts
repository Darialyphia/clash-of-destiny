import { NoAOEShape } from '../../../aoe/no-aoe.aoe-shape';
import type { SpellBlueprint } from '../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';

export const testDestiySpell: SpellBlueprint = {
  id: 'test-destiny-spell',
  kind: CARD_KINDS.SPELL,
  affinity: 'NORMAL',
  name: 'Test Destiny Spell',
  getDescription: () => {
    return `Draw 1 card.`;
  },
  staticDescription: `Draw 1 card.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'placeholder',
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe() {
    return new NoAOEShape();
  },
  onInit() {},
  onPlay(game, card) {
    card.player.cards.draw(1);
  }
};
