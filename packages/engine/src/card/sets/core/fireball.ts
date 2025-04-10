import { PointAOEShape } from '../../../aoe/point.aoe-shape';
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
import { SpellDamage } from '../../../combat/damage';

export const fireball: SpellBlueprint = {
  id: 'fireball',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.FIRE,
  name: 'Fireball',
  getDescription: (game, card) => {
    return `Deal 3 damage to a unit.\n@Class Bonus@: You may discard a fire card. If you do, deal ${3 + card.player.hero.spellpower} instead.`;
  },
  staticDescription: `Deal 3 damage to a unit.\n@Class Bonus@: You may discard a fire card. If you do, deal  @[spellpower]@ + 3 instead.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-fireball',
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.AVENGER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.UNIT });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const [target] = affectedUnits;
    if (!target) return;

    const regularDamage = () => {
      target.takeDamage(card, new SpellDamage({ source: card, baseAmount: 3 }));
    };

    if (!card.hasClassBonus) {
      regularDamage();
      return;
    }

    const fireCardsInHand = card.player.cards.hand.filter(
      c => c.affinity === AFFINITIES.FIRE
    );
    if (!fireCardsInHand.length) {
      regularDamage();
      return;
    }

    game.interaction.startSelectingCards({
      choices: fireCardsInHand,
      minChoices: 0,
      maxChoices: 1,
      player: card.player,
      onComplete(selectedCards) {
        if (selectedCards.length) {
          const [discardedCard] = selectedCards;
          card.player.cards.discard(discardedCard);

          target.takeDamage(
            card,
            new SpellDamage({
              source: card,
              baseAmount: 3 + card.player.hero.spellpower
            })
          );
        } else {
          regularDamage();
        }
      }
    });
  }
};
