import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { arcaneKnowledge } from './abilities/arcane-knowledge';
import { magicMissile } from './abilities/magic-missile';
import { manaShield } from './abilities/mana-shield';
import { staffOfFocus } from './artifacts/staff-of-focus';
import { mage } from './heroes/mage';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [mage, magicMissile, manaShield, arcaneKnowledge, staffOfFocus]
};
