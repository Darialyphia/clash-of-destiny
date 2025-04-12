import { defaultConfig } from '../../config';
import type { CardBlueprint } from '../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  UNIT_KINDS,
  type CardDeckSource
} from '../card.enums';

export type DeckViolation = {
  type: string;
  reason: string;
};

export type ValidatableDeck = {
  id: string;
  name: string;
  [CARD_DECK_SOURCES.MAIN_DECK]: Array<{
    blueprintId: string;
    copies: number;
  }>;
  [CARD_DECK_SOURCES.DESTINY_DECK]: Array<{
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
  maxCopiesForMainDeckCard: number;
  maxCopiesForDestinyCard: number;
  mainDeckSize: number;
  destinyDeckSize: number;
  validate(deck: ValidatableDeck): DeckValidationResult;
  canAdd(card: CardBlueprint, deck: ValidatableDeck): boolean;
};

export class StandardDeckValidator implements DeckValidator {
  constructor(private cardPool: Record<string, CardBlueprint>) {}

  get mainDeckSize(): number {
    return defaultConfig.MAX_MAIN_DECK_SIZE;
  }

  get destinyDeckSize(): number {
    return defaultConfig.MAX_DESTINY_DECK_SIZE;
  }

  get maxCopiesForMainDeckCard(): number {
    return defaultConfig.MAX_MAIN_DECK_CARD_COPIES;
  }

  get maxCopiesForDestinyCard(): number {
    return defaultConfig.MAX_DESTINY_DECK_CARD_COPIES;
  }

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

  private getSize(cards: Array<{ copies: number }>) {
    return cards.reduce((acc, card) => acc + card.copies, 0);
  }

  validate(deck: ValidatableDeck): DeckValidationResult {
    let hasDivineCard = false;
    const violations: DeckViolation[] = [];

    if (
      this.getSize(deck[CARD_DECK_SOURCES.MAIN_DECK]) !== defaultConfig.MAX_MAIN_DECK_SIZE
    ) {
      violations.push({
        type: 'invalid_deck_size',
        reason: `Main deck must have exactly ${defaultConfig.MAX_MAIN_DECK_SIZE} cards.`
      });
    }
    if (
      this.getSize(deck[CARD_DECK_SOURCES.DESTINY_DECK]) !==
      defaultConfig.MAX_DESTINY_DECK_SIZE
    ) {
      violations.push({
        type: 'invalid_deck_size',
        reason: `Destiny deck must have exactly ${defaultConfig.MAX_DESTINY_DECK_SIZE} cards.`
      });
    }

    for (const card of deck[CARD_DECK_SOURCES.MAIN_DECK]) {
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

    const hasShrine = deck[CARD_DECK_SOURCES.DESTINY_DECK].some(card => {
      const blueprint = this.cardPool[card.blueprintId];
      return (
        blueprint?.kind === CARD_KINDS.UNIT && blueprint.unitKind === UNIT_KINDS.SHRINE
      );
    });
    if (!hasShrine) {
      violations.push({
        type: 'no_shrine',
        reason: `Your deck must contain a shrine.`
      });
    }

    for (const card of deck[CARD_DECK_SOURCES.DESTINY_DECK]) {
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

  canAdd(card: CardBlueprint, deck: ValidatableDeck): boolean {
    const withBlueprint = {
      main: deck[CARD_DECK_SOURCES.MAIN_DECK].map(card => ({
        ...card,
        blueprint: this.cardPool[card.blueprintId] as CardBlueprint & {
          decksource: typeof CARD_DECK_SOURCES.MAIN_DECK;
        }
      })),
      destiny: deck[CARD_DECK_SOURCES.DESTINY_DECK].map(card => ({
        ...card,
        blueprint: this.cardPool[card.blueprintId] as CardBlueprint & {
          decksource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
        }
      }))
    };

    const hasDivineCard =
      withBlueprint.main.some(card => card.blueprint.divine) ||
      withBlueprint.destiny.some(card => card.blueprint.divine);
    if (card.divine && hasDivineCard) {
      return false;
    }

    if (card.deckSource === CARD_DECK_SOURCES.MAIN_DECK) {
      if (withBlueprint.main.length >= this.mainDeckSize) {
        return false;
      }
      const existing = withBlueprint.main.find(c => c.blueprint.id === card.id);
      if (existing) {
        if (existing.copies >= this.maxCopiesForMainDeckCard) {
          return false;
        }
        if (card.unique) {
          return false;
        }
      }

      return true;
    } else {
      if (withBlueprint.destiny.length >= this.destinyDeckSize) {
        return false;
      }
      const existing = withBlueprint.destiny.find(c => c.blueprint.id === card.id);
      if (existing) {
        if (existing.copies >= this.maxCopiesForDestinyCard) {
          return false;
        }
        if (card.unique) {
          return false;
        }
      }
      if (card.kind === CARD_KINDS.UNIT && card.unitKind === UNIT_KINDS.SHRINE) {
        const hasShrine = withBlueprint.destiny.some(
          card =>
            card.blueprint.kind === CARD_KINDS.UNIT &&
            card.blueprint.unitKind === UNIT_KINDS.SHRINE
        );
        if (hasShrine) {
          return false;
        }
      }
      return true;
    }
  }
}
