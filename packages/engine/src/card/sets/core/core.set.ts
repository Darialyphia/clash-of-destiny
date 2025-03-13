import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { arcaneKnowledge } from './abilities/arcane-knowledge';
import { magicMissile } from './abilities/magic-missile';
import { manaShield } from './abilities/mana-shield';
import { staffOfFocus } from './artifacts/staff-of-focus';
import { archMage } from './heroes/archmage';
import { mage } from './heroes/mage';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [mage, archMage, magicMissile, manaShield, arcaneKnowledge, staffOfFocus]
};
