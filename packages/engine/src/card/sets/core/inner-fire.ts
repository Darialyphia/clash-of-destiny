import { NoAOEShape } from '../../../aoe/no-aoe.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { AnywhereFollowup } from '../../followups/anywhere-followup';

export const innerFire: SpellBlueprint = {
  id: 'inner-fire',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.FIRE,
  name: 'Inner Fire',
  getDescription: () => {
    return `Wake up an ally with 2 attack or less.`;
  },
  staticDescription: `Wake up an ally with 2 attack or less.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-inner-fire',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.FIGHTER,
  abilities: [],
  getFollowup: game => {
    return new AnywhereFollowup({
      targetingType: TARGETING_TYPE.ALLY_UNIT,
      skippable: false,
      filter: point => {
        const unit = game.unitSystem.getUnitAt(point);
        if (!unit) return false;
        return unit.atk <= 2;
      }
    });
  },
  getAoe() {
    return new NoAOEShape();
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    affectedUnits[0]?.wakeUp();
  }
};
