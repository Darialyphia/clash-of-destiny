import type { CardSet } from '..';
import { CARD_SETS } from '../../card.enums';
import { aidenLv1 } from './aiden-child-of-the-storm';
import { aidenLv2 } from './aiden-stormrider';
import { bubblySlime } from './bubbly-slime';
import { earthShrineOfKnowledge } from './earth-shrine-of-knowledge';
import { esteemedErudite } from './esteemed-erudite';
import { fireShrineOfKnowledge } from './fire-shrine-of-knowledge';
import { fleetingDancer } from './fleeting-dancer';
import { garrisonMarksman } from './garrison-marksman';
import { luminescentMystic } from './luminescent-mystic';
import { promisingRecruit } from './promising-recruit';
import { shieldMaiden } from './shield-maiden';
import { shroudedSorcerer } from './shrouded-sorcerer';
import { slimesToTheRescue } from './slimes-to-the-rescue';
import { stalwartVanguard } from './stalwart-vanguard';
import { stormFlash } from './storm-flash';
import { swordInstructor } from './sword-instructor';
import { testDestinyArtifact } from './test-destiny-artifact';
import { insight } from './insight';
import { waterShrineOfKnowledge } from './water-shrine-of-knowledge';
import { windShrineOfKnowledge } from './wind-shrine-of-knowledge';
import { zoranThePunisher } from './zoran-the-punisher';
import { spark } from './spark';
import { equalityPendant } from './equality-pendant';
import { ceasefire } from './ceasefire';
import { fireball } from './fireball';
import { flameJuggler } from './flame-juggler';
import { pilferingBlade } from './pilfering-blade';
import { aidenLv3 } from './aiden-thunder-incarnate';
import { wrathOfTheSkies } from './wrath-of-the-skies';
import { enjiOneManArmy } from './enji-one-man-army';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    aidenLv1,
    aidenLv2,
    aidenLv3,
    bubblySlime,
    ceasefire,
    earthShrineOfKnowledge,
    enjiOneManArmy,
    equalityPendant,
    esteemedErudite,
    fireball,
    fireShrineOfKnowledge,
    flameJuggler,
    fleetingDancer,
    garrisonMarksman,
    insight,
    luminescentMystic,
    pilferingBlade,
    promisingRecruit,
    shieldMaiden,
    shroudedSorcerer,
    slimesToTheRescue,
    spark,
    stalwartVanguard,
    stormFlash,
    swordInstructor,
    testDestinyArtifact,
    waterShrineOfKnowledge,
    windShrineOfKnowledge,
    wrathOfTheSkies,
    zoranThePunisher
  ]
};
