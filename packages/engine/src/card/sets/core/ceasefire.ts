import { NoAOEShape } from '../../../aoe/no-aoe.aoe-shape';
import { GAME_EVENTS } from '../../../game/game.events';
import { PLAYER_EVENTS } from '../../../player/player-enums';
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

export const ceasefire: SpellBlueprint = {
  id: 'ceasefire',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.NORMAL,
  name: 'Ceasefire',
  getDescription: () => {
    return `Until your next turn, minions come into play exhausted.`;
  },
  staticDescription: `Until your next turn, minions come into play exhausted.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-ceasefire',
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
    const stop = game.on(GAME_EVENTS.UNIT_CREATED, event => {
      event.data.unit.exhaust();
    });

    card.player.once(PLAYER_EVENTS.START_TURN, stop);
  }
};
