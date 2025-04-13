import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { ProvokeModifier } from '../../../modifier/modifiers/provoke.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { floatingDestiny } from '../../abilities/floating-destiny';
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

export const stalwartVanguard: UnitBlueprint = {
  id: 'stalwart-vanguard',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Stalwart Vanguard',
  getDescription: () => {
    return `@Provoke@.`;
  },
  staticDescription: `@Provoke@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-stalwart-vanguard',
  spriteId: 'stalwart-vanguard',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [floatingDestiny],
  atk: 0,
  maxHp: 3,
  job: CARD_JOBS.FIGHTER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new ProvokeModifier(game, card));
  }
};
