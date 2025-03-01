import { keyBy } from 'lodash-es';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_SETS, type CardSetId } from '../card.enums';
import { coreSet } from './core/core.set';
import type { IndexedRecord } from '@game/shared';

export type CardSet = { id: string; name: string; cards: CardBlueprint[] };

export const CARD_SET_DICTIONARY = {
  [CARD_SETS.CORE]: coreSet
} as const satisfies Record<
  CardSetId,
  { id: string; name: string; cards: CardBlueprint[] }
>;

export const CARDS_DICTIONARY = {
  ...keyBy(coreSet.cards, 'id')
} as const satisfies IndexedRecord<CardBlueprint, 'id'>;
