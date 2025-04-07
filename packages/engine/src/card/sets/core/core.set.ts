import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { bubblySlime } from './bubbly-slime';
import { stalwartVanguard } from './stalwart-vanguard';
import { testDestinyArtifact } from './test-destiny-artifact';
import { testDestiySpell } from './test-destiny-spell';
import { testHero } from './test-hero';
import { testShrine } from './test-shrine';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    testShrine,
    stalwartVanguard,
    bubblySlime,
    testDestiySpell,
    testHero,
    testDestinyArtifact
  ]
};
