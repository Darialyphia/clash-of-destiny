import { isDefined } from '@game/shared';
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

export const fireSalamander: UnitBlueprint = {
  id: 'fire-salamander',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Fire Salamander',
  getDescription: () => {
    return `@On Enter@: Give up to 3 @Overheat@ stacks, split among minions.`;
  },
  staticDescription: `@On Enter@: Give up to 3 @Overheat@ stacks, split among minions.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-fire-salamander',
  spriteId: 'fire-salamander',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  manaCost: 5,
  atk: 3,
  maxHp: 5,
  job: CARD_JOBS.SUMMONER,
  abilities: [
    {
      id: 'fire-salamander-heal',
      isCardAbility: false,
      shouldExhaust: true,
      manaCost: 2,
      canUse() {
        return true;
      },
      getDescription() {
        return `@[exhaust]@ @[mana] 2@ : Remove all @Overheat@ stacks from a unit. Deal that amount of damage to the enemy hero./ Heal your hero for that amount.`;
      },
      staticDescription:
        '@[exhaust]@ @[mana] 2@ : Remove all @Overheat@ stacks from a unit. Deal that amount of damage to the enemy hero./ Heal your hero for that amount.',
      label: 'Remove heat',
      getFollowup() {
        return new AnywhereFollowup({ targetingType: TARGETING_TYPE.UNIT });
      },
      onResolve(game, card, targets) {
        const unit = game.unitSystem.getUnitAt(targets[0].cell);
        if (!unit) return;

        const overheatStacks = unit.getModifier(OverheatModifier)?.stacks ?? 0;
        if (overheatStacks > 0) {
          unit.removeModifier(OverheatModifier);
          card.player.opponent.hero.takeDamage(
            card,
            new AbilityDamage({
              source: card,
              baseAmount: overheatStacks
            })
          );
          card.player.hero.heal(card, overheatStacks);
        }
      }
    }
  ],
  getFollowup: (game, card) => {
    return new MultiTargetFollowup(game, card, [
      new MinionFollowup(),
      new AnywhereFollowup({
        targetingType: TARGETING_TYPE.MINION,
        skippable: true
      }),
      new AnywhereFollowup({
        targetingType: TARGETING_TYPE.MINION,
        skippable: true
      }),
      new AnywhereFollowup({
        targetingType: TARGETING_TYPE.MINION,
        skippable: true
      })
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
      },
      {
        shape: new PointAOEShape(game, card.player),
        getPoints(points) {
          return [points[2]];
        }
      },
      {
        shape: new PointAOEShape(game, card.player),
        getPoints(points) {
          return [points[3]];
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
