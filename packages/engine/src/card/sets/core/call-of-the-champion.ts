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
import { NoAOEShape } from '../../../aoe/no-aoe.aoe-shape';
import { UniqueModifier } from '../../../modifier/modifiers/unique.modifier';

export const callOfTheChampion: SpellBlueprint = {
  id: 'call-of-the-champion',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.NORMAL,
  name: 'Call Forth !',
  getDescription: () => {
    return `Select a @Unique@ minion from your deck and add it to your hand.`;
  },
  staticDescription: `Select a @Unique@ minion from your deck and add it to your hand.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-call-of-the-champion',
  rarity: RARITIES.RARE,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.FIGHTER,
  abilities: [],
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe() {
    return new NoAOEShape();
  },
  onInit() {},
  onPlay(game, card) {
    game.interaction.startSelectingCards({
      player: card.player,
      choices: card.player.cards.mainDeck.cards.filter(
        c => c.hasModifier(UniqueModifier) && c.kind === CARD_KINDS.UNIT
      ),
      minChoices: 0,
      maxChoices: 1,
      onComplete(selectedCards) {
        if (selectedCards.length === 0) {
          return;
        }
        const selectedCard = selectedCards[0];
        card.player.cards.mainDeck.pluck(selectedCard);
        card.player.cards.addToHand(selectedCard);
      }
    });
  }
};
