import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, RARITIES, UNIT_KINDS } from '../../../card.enums';

export const acolyte: UnitBlueprint = {
  id: 'acolyte',
  name: 'Acolyte',
  getDescription(game, unit) {
    return '';
  },
  initiative: 7,
  kind: CARD_KINDS.UNIT,
  level: 1,
  maxHp: 15,
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  unitKind: UNIT_KINDS.HERO,
  iconId: 'unit-acolyte',
  cardIconId: 'placeholder',
  spriteId: 'acolyte',
  spriteParts: {
    armor: 'tier1',
    weapon: 'tier1',
    head: 'tier1'
  },
  getAoe(game, unit) {
    return new PointAOEShape(game, unit.player, TARGETING_TYPE.EMPTY);
  },
  onPlay() {}
};
