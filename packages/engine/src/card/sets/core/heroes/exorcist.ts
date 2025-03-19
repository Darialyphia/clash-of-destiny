import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, CARD_SETS, RARITIES, UNIT_KINDS } from '../../../card.enums';
import { acolyte } from './acolyte';

export const exorcist: UnitBlueprint = {
  id: 'exorcist',
  name: 'Exorcist',
  getDescription() {
    return '';
  },
  initiative: 8,
  kind: CARD_KINDS.UNIT,
  level: 2,
  neededExp: 10,
  previousClass: acolyte.id,
  maxHp: 16,
  rarity: RARITIES.EPIC,
  setId: CARD_SETS.CORE,
  unitKind: UNIT_KINDS.HERO,
  iconId: 'unit-exorcist',
  cardIconId: 'placeholder',
  spriteId: 'acolyte',
  spriteParts: {
    armor: 'tier2',
    weapon: 'tier2',
    helm: 'tier2',
    vfx: 'tier2'
  },
  getAoe(game, unit) {
    return new PointAOEShape(game, unit.player, TARGETING_TYPE.EMPTY);
  },
  onPlay() {}
};
