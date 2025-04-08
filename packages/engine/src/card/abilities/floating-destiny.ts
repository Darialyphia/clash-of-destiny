import type { Ability } from '../card-blueprint';
import type { AnyCard } from '../entities/card.entity';
import { NoFollowup } from '../followups/no-followup';

export const floatingDestiny: Ability<AnyCard> = {
  id: 'floating-destiny',
  isCardAbility: true,
  staticDescription: '@Floating Destiny@',
  getDescription() {
    return `@Floating Destiny@`;
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
