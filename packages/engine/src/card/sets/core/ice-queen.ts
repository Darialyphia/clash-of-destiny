import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { FrozenModifier } from '../../../modifier/modifiers/frozen-modifier';
import { RangedModifier } from '../../../modifier/modifiers/ranged.modiier';
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

export const iceQueen: UnitBlueprint = {
  id: 'ice-queen',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Ice Queen',
  getDescription: () => {
    return `@On Enter@ : @Freeze@ nearby enemy minions.`;
  },
  staticDescription: `@On Enter@ : @Freeze@ nearby enemy minions.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-ice-queen',
  spriteId: 'ice-queen',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [floatingDestiny],
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
  onPlay(game, card) {
    const nearbyEnemies = game.unitSystem
      .getNearbyUnits(card.unit.position)
      .filter(u => u.isEnemy(card.unit) && u.isMinion);

    nearbyEnemies.forEach(enemy => {
      enemy.addModifier(new FrozenModifier(game, card));
    });
  }
};
