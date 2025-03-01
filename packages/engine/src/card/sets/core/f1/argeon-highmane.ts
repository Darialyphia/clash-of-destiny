import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, UNIT_TYPES, RARITIES, FACTIONS } from '../../../card.enums';

export const argeonHighmane: UnitBlueprint = {
  id: 'f1_general',
  setId: 'CORE',
  name: 'Argeon Highmane',
  description: '',
  kind: CARD_KINDS.UNIT,
  unitType: UNIT_TYPES.GENERAL,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  keywords: [],
  manaCost: 2,
  atk: 2,
  maxHp: 25,
  followup: {
    getTargets() {
      return [];
    },
    canCommit() {
      return true;
    }
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player);
  },
  abilities: [],
  onInit() {
    return;
  },
  onPlay() {
    return;
  }
};
