import { CARD_DECK_SOURCES } from './card.enums';
import type { AnyCard } from './entities/card.entity';

export class NotEnoughManaError extends Error {
  constructor() {
    super('Not enough mana');
  }
}

export class CardNotFoundError extends Error {
  constructor() {
    super('Card not found');
  }
}

export class WrongDeckSourceError extends Error {
  constructor(card: AnyCard) {
    super(
      card.deckSource === CARD_DECK_SOURCES.MAIN_DECK
        ? 'Card should be in the main deck'
        : 'Card should be in the destiny deck'
    );
  }
}

export class AbilityNotFoundError extends Error {
  constructor() {
    super('Ability not found');
  }
}
