import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, RARITIES, UNIT_KINDS } from '../../../card.enums';

export const mage: UnitBlueprint = {
  id: 'mage',
  name: 'Mage',
  description: '',
  initiative: 7,
  kind: CARD_KINDS.UNIT,
  level: 1,
  maxHp: 16,
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  unitKind: UNIT_KINDS.HERO,
  iconId: 'unit-mage',
  cardIconId: 'placeholder',
  spriteId: 'wizard',
  spriteParts: {
    armor: 'tier1',
    weapon: 'tier1',
    helm: 'tier3',
    vfx: 'tier1'
  },
  getAoe(game, unit) {
    return new PointAOEShape(game, unit.player, TARGETING_TYPE.EMPTY);
  },
  onPlay() {}
};
