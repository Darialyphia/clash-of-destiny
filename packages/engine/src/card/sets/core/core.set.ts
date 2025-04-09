import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { aidenLv1 } from './aiden-child-of-the-storm';
import { aidenLv2 } from './aiden-stormrider';
import { bubblySlime } from './bubbly-slime';
import { earthShrineOfKnowledge } from './earth-shrine-of-knowledge';
import { esteemedErudite } from './esteemed-erudite';
import { fireShrineOfKnowledge } from './fire-shrine-of-knowledge';
import { garrisonMarksman } from './garrison-marksman';
import { luminescentMystic } from './luminescent-mystic';
import { promisingRecruit } from './promising-recruit';
import { shroudedSorcerer } from './shrouded-sorcerer';
import { stalwartVanguard } from './stalwart-vanguard';
import { stormFlash } from './storm-flash';
import { swordInstructor } from './sword-instructor';
import { testDestinyArtifact } from './test-destiny-artifact';
import { testDestiySpell } from './test-destiny-spell';
import { waterShrineOfKnowledge } from './water-shrine-of-knowledge';
import { windShrineOfKnowledge } from './wind-shrine-of-knowledge';
import { zoranThePunisher } from './zoran-the-punisher';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    fireShrineOfKnowledge,
    waterShrineOfKnowledge,
    earthShrineOfKnowledge,
    windShrineOfKnowledge,
    stalwartVanguard,
    esteemedErudite,
    bubblySlime,
    garrisonMarksman,
    swordInstructor,
    promisingRecruit,
    luminescentMystic,
    shroudedSorcerer,
    zoranThePunisher,
    stormFlash,
    testDestiySpell,
    aidenLv1,
    aidenLv2,
    testDestinyArtifact
  ]
};
