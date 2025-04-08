import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { MinionFollowup } from '../../followups/minion.followup';
import { NoFollowup } from '../../followups/no-followup';

export const esteemedErudite: UnitBlueprint = {
  id: 'esteemed-erudite',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Esteemed Erudite',
  getDescription: () => {
    return ``;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-esteemed-erudite',
  spriteId: 'esteemed-erudite',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [
    {
      id: 'esteemed-erudite-draw',
      isCardAbility: false,
      staticDescription: '@[exhaust]@ @[mana] 1@ : @Draw 1 card',
      getDescription() {
        return `@[exhaust]@ @[mana] 1@ : Draw 1 card`;
      },
      label: 'Draw 1 card',
      manaCost: 1,
      shouldExhaust: true,
      canUse() {
        return true;
      },
      getFollowup() {
        return new NoFollowup();
      },
      onResolve(game, card) {
        card.player.cards.draw(1);
      }
    }
  ],
  atk: 1,
  maxHp: 2,
  job: CARD_JOBS.SPELLCASTER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay() {}
};
