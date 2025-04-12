import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../combat/damage';
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
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { MinionFollowup } from '../../followups/minion.followup';
import { MultiTargetFollowup } from '../../followups/multi-target-followup';

export const flameExorcist: UnitBlueprint = {
  id: 'flame-exorcist',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Flame Exorcist',
  getDescription: () => {
    return `@On Enter@: Deal 1 damage to an enemy. If it had @Overheat@, draw a card.`;
  },
  staticDescription: `@On Enter@: Deal 1 damage to an enemy. If it had @Overheat@, draw a card.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-flame-exorcist',
  spriteId: 'flame-exorcist',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 3,
  job: CARD_JOBS.WANDERER,
  getFollowup: (game, card) => {
    return new MultiTargetFollowup(game, card, [
      new MinionFollowup(),
      new AnywhereFollowup({ targetingType: TARGETING_TYPE.ENEMY_UNIT, skippable: true })
    ]);
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
        shape: new PointAOEShape(game, card.player),
        getPoints(points) {
          return [points[1]];
        }
      }
    ]);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const [, target] = affectedUnits;
    if (!target) return;

    target.takeDamage(
      card,
      new AbilityDamage({
        source: card,
        baseAmount: 1
      })
    );
    if (target.hasModifier(OverheatModifier)) {
      card.player.cards.draw(1);
    }
  }
};
