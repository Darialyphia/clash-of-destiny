import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { ElusiveModifier } from '../../../modifier/modifiers/elusive.modifier';
import { ProvokeModifier } from '../../../modifier/modifiers/provoke.modifier';
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

export const playfulEels: UnitBlueprint = {
  id: 'playful-eels',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Playful Eels',
  getDescription: () => {
    return `@Provoke@, @Elusive@.`;
  },
  staticDescription: `@Provoke@, @Elusive@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-playful-eels',
  spriteId: 'playful-eels',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 0,
  maxHp: 1,
  job: CARD_JOBS.SUMMONER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new ProvokeModifier(game, card));
    card.unit.addModifier(new ElusiveModifier(game, card));
  }
};
