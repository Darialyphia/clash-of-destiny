import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { arcaneKnowledge } from './abilities/arcane-knowledge';
import { cureWounds } from './abilities/cure-wounds';
import { forceWave } from './abilities/force-wave';
import { frostNova } from './abilities/frost-nova';
import { inspire } from './abilities/inspire';
import { magicAmplification } from './abilities/magic-amplification';
import { magicMissile } from './abilities/magic-missile';
import { manaShield } from './abilities/mana-shield';
import { purify } from './abilities/purify';
import { rooted } from './abilities/rooted';
import { staffOfFocus } from './artifacts/staff-of-focus';
import { acolyte } from './heroes/acolyte';
import { archMage } from './heroes/archmage';
import { exorcist } from './heroes/exorcist';
import { mage } from './heroes/mage';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    mage,
    archMage,
    magicMissile,
    manaShield,
    arcaneKnowledge,
    magicAmplification,
    frostNova,
    forceWave,
    staffOfFocus,

    acolyte,
    exorcist,
    cureWounds,
    purify,
    inspire,

    rooted
  ]
};
