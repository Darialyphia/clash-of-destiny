import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { bubblySlime } from './bubbly-slime';
import { earthShrineOfKnowledge } from './earth-shrine-of-knowledge';
import { esteemedErudite } from './esteemed-erudite';
import { fireShrineOfKnowledge } from './fire-shrine-of-knowledge';
import { garrisonMarksman } from './garrison-marksman';
import { stalwartVanguard } from './stalwart-vanguard';
import { swordInstructor } from './sword-instructor';
import { testDestinyArtifact } from './test-destiny-artifact';
import { testDestiySpell } from './test-destiny-spell';
import { testHero } from './test-hero';
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
    zoranThePunisher,
    testDestiySpell,
    testHero,
    testDestinyArtifact
  ]
};
