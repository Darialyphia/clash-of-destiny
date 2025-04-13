import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnDeathModifier } from '../../../modifier/modifiers/on-death.modifier';
import { OverheatModifier } from '../../../modifier/modifiers/overheat.modifier';
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

export const willOWisp: UnitBlueprint = {
  id: 'will-o-wisp',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Will-o-Wisp',
  getDescription: () => {
    return `@On Death@: Give @Overheat(1)@ to nearby enemies.`;
  },
  staticDescription: `@On Death@: Give @Overheat(1)@ to nearby enemies.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-will-o-wisp',
  spriteId: 'will-o-wisp',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
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
    card.unit.addModifier(
      new OnDeathModifier(game, card, {
        handler(event) {
          const nearbyEnemies = game.unitSystem
            .getNearbyUnits(event.data.destroyedAt)
            .filter(u => u.isEnemy(card.unit));
          nearbyEnemies.forEach(enemy => {
            enemy.addModifier(new OverheatModifier(game, card));
          });
        }
      })
    );
  }
};
