import { defaultConfig } from '../../config';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_DECK_SOURCES, type CardDeckSource } from '../card.enums';

export type DeckViolation = {
  type: string;
  reason: string;
};

export type ValidatableDeck = {
  main: Array<{
    blueprintId: string;
    copies: number;
  }>;
  destiny: Array<{
    blueprintId: string;
    copies: number;
  }>;
};

export type DeckValidationResult =
  | {
      result: 'success';
    }
  | { result: 'failure'; violations: Array<DeckViolation> };

export type DeckValidator = {
  validate(deck: ValidatableDeck): DeckValidationResult;
};

export class StandardDeckValidator implements DeckValidator {
  constructor(private cardPool: Record<string, CardBlueprint>) {}

  private validateCard(
    card: {
      blueprint: CardBlueprint;
      copies: number;
    },
    source: CardDeckSource,
    hasDivineCard: boolean
  ): DeckViolation[] {
    const violations: DeckViolation[] = [];
    if (card.blueprint.deckSource !== source) {
      violations.push({
        type: 'invalid_card_source',
        reason: `Card ${card.blueprint.name} is not allowed in ${source}.`
      });
    }

    if (card.blueprint.divine && hasDivineCard) {
      violations.push({
        type: 'too_many_divine_cards',
        reason: `The deck has too many Divine cards.`
      });
    }

    if (card.blueprint.unique && card.copies > 1) {
      violations.push({
        type: 'too_many_copies_unique',
        reason: `Card ${card.blueprint.name} is unique and cannot be included more than once.`
      });
    }

    if (card.copies > defaultConfig.MAX_MAIN_DECK_CARD_COPIES) {
      violations.push({
        type: 'too_many_copies',
        reason: `Card ${card.blueprint.name} has too many copies.`
      });
    }

    return violations;
  }

  validate(deck: ValidatableDeck): DeckValidationResult {
    let hasDivineCard = false;
    const violations: DeckViolation[] = [];

    for (const card of deck.main) {
      const blueprint = this.cardPool[card.blueprintId];
      if (!blueprint) {
        violations.push({
          type: 'unknown_card',
          reason: `Card with Id ${card.blueprintId} not found in card pool.`
        });
      }

      violations.push(
        ...this.validateCard(
          {
            blueprint,
            copies: card.copies
          },
          CARD_DECK_SOURCES.MAIN_DECK,
          hasDivineCard
        )
      );

      if (blueprint.divine) {
        hasDivineCard = true;
      }
    }

    for (const card of deck.destiny) {
      const blueprint = this.cardPool[card.blueprintId];
      if (!blueprint) {
        violations.push({
          type: 'unknown_card',
          reason: `Card with Id ${card.blueprintId} not found in card pool.`
        });
      }

      violations.push(
        ...this.validateCard(
          {
            blueprint,
            copies: card.copies
          },
          CARD_DECK_SOURCES.DESTINY_DECK,
          hasDivineCard
        )
      );

      if (blueprint.divine) {
        hasDivineCard = true;
      }
    }
    return { result: 'success' };
  }
}
