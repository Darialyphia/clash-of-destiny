import type { Ability } from '../card-blueprint';
import type { AnyCard } from '../entities/card.entity';
import { NoFollowup } from '../followups/no-followup';

export const lastingDestiny: Ability<AnyCard> = {
  id: 'lasting-destiny',
  isCardAbility: true,
  staticDescription: '@Lasting Destiny@',
  getDescription() {
    return `@Lasting Destiny@`;
  },
  manaCost: 0,
  shouldExhaust: false,
  label: 'Banish: +1 Destiny',
  getFollowup() {
    return new NoFollowup();
  },
  canUse(game, card) {
    const locatedCard = card.player.cards.findCard(card.id);

    return locatedCard?.location === 'discardPile';
  },
  onResolve(game, card) {
    card.player.cards.removeFromDiscardPile(card);
    card.player.cards.sendToBanishPile(card);
    card.player.destiny.add(1);
  }
};
