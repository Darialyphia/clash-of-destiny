import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { ProvokeModifier } from '../../../modifier/modifiers/provoke.modifier';
import { VigilantModifier } from '../../../modifier/modifiers/vigilant.modifier';
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

export const shieldMaiden: UnitBlueprint = {
  id: 'shield-maiden',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Shield Maiden',
  getDescription: () => {
    return `@Provoke@.\n@Vigilant@`;
  },
  staticDescription: `@Provoke@.\n@Vigilant@`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-shield-maiden',
  spriteId: 'shield-maiden',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [floatingDestiny],
  atk: 2,
  maxHp: 4,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new ProvokeModifier(game, card));
    card.unit.addModifier(new VigilantModifier(game, card));
  }
};
