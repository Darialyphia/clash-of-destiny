import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../combat/damage';
import { DefiantModifier } from '../../../modifier/modifiers/defiant.modifier';
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

export const shroudedSorcerer: UnitBlueprint = {
  id: 'shrouded-sorcerer',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Shrouded Sorcerer',
  getDescription: () => {
    return ``;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-shrouded-sorcerer',
  spriteId: 'shrouded-sorcerer',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  atk: 2,
  maxHp: 3,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [
    {
      id: 'shrouded-sorcerer',
      isCardAbility: false,
      staticDescription:
        '@[exhaust]@ @[mana] 2@ : Deal damage to target unit equal to your Destiny. @Class Bonus@: If that destroys the unit, activate this.',
      getDescription() {
        return '@[exhaust]@ @[mana] 2@ : Deal damage to target unit equal to your Destiny. @Class Bonus@: If that destroys the unit, activate this.';
      },
      label: 'Deal damage',
      manaCost: 2,
      shouldExhaust: true,
      canUse() {
        return true;
      },
      getFollowup() {
        return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ENEMY_UNIT });
      },
      onResolve(game, card, targets) {
        const unit = game.unitSystem.getUnitAt(targets[0].cell);
        if (!unit) return;

        const result = unit.takeDamage(
          card,
          new AbilityDamage({ source: card, baseAmount: card.player.destiny.current })
        );
        if (result.isFatal && card.job === card.player.hero.card.job) {
          game.inputSystem.schedule(() => {
            card.unit.wakeUp();
          });
        }
      }
    }
  ],
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay() {}
};
