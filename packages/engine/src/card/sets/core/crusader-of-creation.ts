import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnKillModifier } from '../../../modifier/modifiers/on-kill.modifier';
import { SimpleHealthBuffModifier } from '../../../modifier/modifiers/simple-health-buff.modifier';
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

export const crusaderOfCreation: UnitBlueprint = {
  id: 'crusader-of-creation',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.GENESIS,
  name: 'Crusader of Creation',
  getDescription: () => {
    return `@On Kill@: Wake up this unit.\n@Class Bonus@: +1 Health.`;
  },
  staticDescription: `@On Kill@: Wake up this unit.\n@Class Bonus@: +1 Health.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-crusader-of-creation',
  spriteId: 'crusader-of-creation',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 3,
  maxHp: 5,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(
      new OnKillModifier(game, card, {
        handler() {
          game.inputSystem.schedule(() => {
            card.unit.wakeUp();
          });
        }
      })
    );

    if (card.hasClassBonus) {
      card.unit.addModifier(
        new SimpleHealthBuffModifier('crusader-of-creation-buff', game, card, {
          amount: 1
        })
      );
    }
  }
};
