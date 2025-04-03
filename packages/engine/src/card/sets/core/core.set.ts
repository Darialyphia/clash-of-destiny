import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { testMinion } from './test-minion';
import { testShrine } from './test-shrine';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [testShrine, testMinion]
};
