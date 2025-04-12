import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS
} from '@game/engine/src/card/card.enums';
import type {
  DeckValidator,
  ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { nanoid } from 'nanoid';

export type DeckBuilderCardPool = Array<{
  blueprint: CardBlueprint;
  copiesOwned: number;
}>;

export class DeckBuildervModel {
  private _deck: ValidatableDeck = {
    id: nanoid(4),
    name: 'New Deck',
    [CARD_DECK_SOURCES.MAIN_DECK]: [],
    [CARD_DECK_SOURCES.DESTINY_DECK]: []
  };

  constructor(
    private cardPool: DeckBuilderCardPool,
    private _validator: DeckValidator
  ) {
    this.cardPool = cardPool;
  }

  addCard(blueprintId: string) {
    const card = this.cardPool.find(card => card.blueprint.id === blueprintId);
    if (!card) {
      throw new Error(`Card with ID ${blueprintId} not found in card pool.`);
    }
    const deckSource = card.blueprint.deckSource;
    const existing = this._deck[deckSource].find(
      card => card.blueprintId === blueprintId
    );
    if (existing) {
      existing.copies++;
    } else {
      this._deck[deckSource].push({ blueprintId, copies: 1 });
    }
  }

  removeCard(blueprintId: string) {
    const deckSource = this.cardPool.find(
      card => card.blueprint.id === blueprintId
    )?.blueprint.deckSource;
    if (!deckSource) {
      throw new Error(`Card with ID ${blueprintId} not found in card pool.`);
    }
    const existing = this._deck[deckSource].find(
      card => card.blueprintId === blueprintId
    );
    if (existing) {
      existing.copies--;
      if (existing.copies <= 0) {
        this._deck[deckSource] = this._deck[deckSource].filter(
          card => card.blueprintId !== blueprintId
        );
      }
    }
  }

  get validator() {
    return this._validator;
  }

  get deck() {
    return this._deck;
  }

  get mainDeckSize() {
    return this._deck[CARD_DECK_SOURCES.MAIN_DECK].reduce(
      (acc, card) => acc + card.copies,
      0
    );
  }

  get destinyDeckSize() {
    return this._deck[CARD_DECK_SOURCES.DESTINY_DECK].reduce(
      (acc, card) => acc + card.copies,
      0
    );
  }

  get mainDeckCards() {
    return this._deck[CARD_DECK_SOURCES.MAIN_DECK]
      .map(card => {
        const blueprint = this.cardPool.find(
          c => c.blueprint.id === card.blueprintId
        )!.blueprint as CardBlueprint & {
          deckSource: typeof CARD_DECK_SOURCES.MAIN_DECK;
        };

        return {
          ...card,
          blueprint
        };
      })
      .toSorted((a, b) => {
        if (a.blueprint.manaCost === b.blueprint.manaCost) {
          return a.blueprint.name.localeCompare(b.blueprint.name);
        }
        return a.blueprint.manaCost - b.blueprint.manaCost;
      });
  }

  get destinyDeckCards() {
    return this._deck[CARD_DECK_SOURCES.DESTINY_DECK]
      .map(card => {
        const blueprint = this.cardPool.find(
          c => c.blueprint.id === card.blueprintId
        )!.blueprint as CardBlueprint & {
          deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
        };

        return {
          ...card,
          blueprint
        };
      })
      .toSorted((a, b) => {
        if (a.blueprint.kind === CARD_KINDS.UNIT) {
          if (b.blueprint.kind === CARD_KINDS.UNIT) {
            if (a.blueprint.destinyCost !== b.blueprint.destinyCost) {
              return a.blueprint.destinyCost - b.blueprint.destinyCost;
            }
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return -1;
        }

        if (b.blueprint.kind === CARD_KINDS.UNIT) {
          return 1;
        }

        if (a.blueprint.destinyCost === b.blueprint.destinyCost) {
          return a.blueprint.name.localeCompare(b.blueprint.name);
        }
        return a.blueprint.destinyCost - b.blueprint.destinyCost;
      });
  }

  getErrors() {
    return this._validator.validate(this._deck);
  }

  loadDeck(deck: ValidatableDeck) {
    this._deck = deck;
  }

  canAdd(blueprintId: string) {
    const card = this.cardPool.find(card => card.blueprint.id === blueprintId);
    if (!card) {
      throw new Error(`Card with ID ${blueprintId} not found in card pool.`);
    }
    return this._validator.canAdd(card.blueprint, this._deck);
  }

  reset() {
    this._deck = {
      id: nanoid(4),
      name: 'New Deck',
      [CARD_DECK_SOURCES.MAIN_DECK]: [],
      [CARD_DECK_SOURCES.DESTINY_DECK]: []
    };
  }
}
