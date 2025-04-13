import { isDefined } from '@game/shared';
import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
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
import { RingAOEShape } from '../../../aoe/ring.aoe-shape';

export const fireSalamander: UnitBlueprint = {
  id: 'fire-salamander',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Fire Salamander',
  getDescription: () => {
    return `@On Enter@: nearby enemies gain 1 @Overheat@ stack.\n@On Kill@: if the killed unit had @Overheat@, deal its stacks as damage to the enemy hero.`;
  },
  staticDescription: `@On Enter@: nearby enemies gain 1 @Overheat@ stack.\n@On Kill@: if the killed unit had @Overheat@, deal its stacks as damage to the enemy hero.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-fire-salamander',
  spriteId: 'fire-salamander',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  manaCost: 5,
  atk: 3,
  maxHp: 3,
  job: CARD_JOBS.SUMMONER,
  abilities: [],
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.player),
        getPoints(points) {
          return points;
        }
      },
      {
        shape: new RingAOEShape(game, card.player, {
          targetingType: TARGETING_TYPE.ENEMY_UNIT
        }),
        getPoints(points) {
          return points;
        }
      }
    ]);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const [, target1, target2, target3] = affectedUnits;

    const targets = [target1, target2, target3].filter(isDefined);

    targets.forEach(target => {
      target.addModifier(new OverheatModifier(game, card));
    });
  }
};
