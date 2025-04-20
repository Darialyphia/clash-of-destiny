import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../combat/damage';
import { SwiftModifier } from '../../../modifier/modifiers/swift.modifier';
import { UniqueModifier } from '../../../modifier/modifiers/unique.modifier';
import { VigilantModifier } from '../../../modifier/modifiers/vigilant.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { Unit } from '../../../unit/entities/unit.entity';
import { bresenham } from '../../../utils/bresenham';
import { Position } from '../../../utils/position.component';
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
import { MeleeFollowup } from '../../followups/melee-followup';
import { MinionFollowup } from '../../followups/minion.followup';

export const lileeSinTheArdentMonk: UnitBlueprint = {
  id: 'lilee-sin-the-ardent-monk',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Lilee-Sin, the Ardent Monk',
  getDescription: () => {
    return `@Unique@, @Vigilant@.`;
  },
  staticDescription: `@Unique@, @Vigilant@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-ardent-monk',
  spriteId: 'ardent-monk',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 3,
  unique: true,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [
    {
      id: 'lilee-sin-the-ardent-monk',
      getDescription() {
        return '@[exhaust]@ : Knock back an enemy minion 2 tiles. If it is knocked back into another unit, they both take 2 damage.';
      },
      staticDescription:
        '@[exhaust]@ : Knock back an enemy minion 2 tiles. If it is knocked back into another unit, they both take 2 damage.',
      canUse() {
        return true;
      },
      getFollowup(game, card) {
        return new MeleeFollowup({
          position: card.unit.position,
          allowDiagonals: false,
          targetingType: TARGETING_TYPE.ENEMY_MINION
        });
      },
      isCardAbility: false,
      manaCost: 0,
      shouldExhaust: true,
      label: 'Knock Back',

      onResolve(game, card, targets) {
        const [target] = targets;
        if (!target) return;
        const targetUnit = game.unitSystem.getUnitAt(target.cell);
        if (!targetUnit) return;

        const direction = Position.fromPoint(target.cell).sub(card.unit.position);
        console.log(direction);
        const knockbackPosition = Position.fromPoint(target.cell).add(
          direction.normalize().scale({ x: 2, y: 2 })
        );

        const path = bresenham(target.cell, knockbackPosition, { includeStart: false });
        let destination = target.cell;
        let collidedUnit: Unit | null = null;
        for (const point of path) {
          const unit = game.unitSystem.getUnitAt(point);
          if (unit) {
            collidedUnit = unit;
            break;
          }
          destination = point;
        }

        targetUnit.teleport(destination);
        if (collidedUnit) {
          targetUnit.takeDamage(card, new AbilityDamage({ source: card, baseAmount: 2 }));
          collidedUnit.takeDamage(
            card,
            new AbilityDamage({ source: card, baseAmount: 2 })
          );
        }
      }
    }
  ],
  atk: 3,
  maxHp: 2,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(new UniqueModifier(game, card));
  },
  onPlay(game, card) {
    card.unit.addModifier(new VigilantModifier(game, card));
  }
};
