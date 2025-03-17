import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, RARITIES, UNIT_KINDS } from '../../../card.enums';
import { mage } from './mage';

export const archMage: UnitBlueprint = {
  id: 'archMage',
  name: 'Elementalist',
  getDescription() {
    return '';
  },
  initiative: 8,
  kind: CARD_KINDS.UNIT,
  level: 2,
  neededExp: 10,
  previousClass: mage.id,
  maxHp: 16,
  rarity: RARITIES.EPIC,
  setId: CARD_SETS.CORE,
  unitKind: UNIT_KINDS.HERO,
  iconId: 'unit-archmage',
  cardIconId: 'placeholder',
  spriteId: 'wizard',
  spriteParts: {
    armor: 'tier3',
    weapon: 'tier3',
    helm: 'tier3',
    vfx: 'tier3'
  },
  getAoe(game, unit) {
    return new PointAOEShape(game, unit.player, TARGETING_TYPE.EMPTY);
  },
  onPlay() {}
};
