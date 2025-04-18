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

export const sandsOfTime: SpellBlueprint = {
  id: 'sands-of-time',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.NORMAL,
  name: 'Sands of Time',
  getDescription: () => {
    return `Both heroes return to the position and health they had at the start of your last turn if able.`;
  },
  staticDescription: `Both heroes return to the position and health they had at the start of your last turn if able.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-sands-of-time',
  rarity: RARITIES.EPIC,
  collectable: true,
  destinyCost: 2,
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
  onPlay(game, card) {}
};
