import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { argeonHighmane } from './f1/argeon-highmane';
import { healingMystic } from './neutral/healing-mystic';
import { primusFist } from './neutral/primus-fist';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [argeonHighmane, healingMystic, primusFist]
};
