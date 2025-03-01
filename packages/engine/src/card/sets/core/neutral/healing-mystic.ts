import { AnywhereTargetingStrategy } from '../../../../targeting/anywhere-targeting-strategy';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { OpeningGambitModifier } from '../../../../modifier/modifiers/opening-gambit.modifier';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, UNIT_TYPES } from '../../../card.enums';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { minionFollowup } from '../../../card-utils';

export const healingMystic: UnitBlueprint = {
  id: 'neutral_healing_mystic',
  setId: 'CORE',
  name: 'Healing Mystic',
  description: '@Opening Gambit@: Restore 2 Health to a unit.',
  kind: CARD_KINDS.UNIT,
  unitType: UNIT_TYPES.MINION,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  keywords: [],
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  followup: minionFollowup((game, card) => [
    {
      type: 'cell',
      isElligible(point) {
        return new AnywhereTargetingStrategy(
          game,
          card.player,
          TARGETING_TYPE.UNIT
        ).canTargetAt(point);
      }
    }
  ]),

  getAoe(game, card) {
    return new PointAOEShape(game, card.player);
  },
  abilities: [],
  onInit(game, card) {
    card.addModifier(
      new OpeningGambitModifier(game, card, event => {
        const [, target] = event.units;
        if (!target) return;
        target.heal(card, 2);
      })
    );
  },
  onPlay() {}
};
