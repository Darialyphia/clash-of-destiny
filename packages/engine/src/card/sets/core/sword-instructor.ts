import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { SimpleAttackBuffModifier } from '../../../modifier/modifiers/simple-attack-buff.modifier';
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

export const swordInstructor: UnitBlueprint = {
  id: 'sword-instructor',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Sword Instructor',
  getDescription: () => {
    return ``;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-sword-instructor',
  spriteId: 'sword-instructor',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [
    {
      id: 'sword-instructor-ability',
      isCardAbility: false,
      staticDescription: '@[exhaust]@ : Give +1 Attack to an ally minion.',
      getDescription() {
        return '@[exhaust]@ : Give +1 Attack to an ally minion.';
      },
      label: 'Ally +1 ATK',
      manaCost: 0,
      shouldExhaust: true,
      canUse() {
        return true;
      },
      getFollowup() {
        return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ALLY_MINION });
      },
      onResolve(game, card, targets) {
        const target = game.unitSystem.getUnitAt(targets[0].cell);
        if (!target) return;

        target.addModifier(
          new SimpleAttackBuffModifier('sword-instructor-buff', game, card, {
            amount: 1,
            name: 'Sword Instructor Buff'
          })
        );
      }
    }
  ],
  atk: 1,
  maxHp: 3,
  job: CARD_JOBS.SPELLCASTER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay() {}
};
