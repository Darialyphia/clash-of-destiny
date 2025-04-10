import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../combat/damage';
import { FlankModifier } from '../../../modifier/modifiers/flank.modifier';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { UniqueModifier } from '../../../modifier/modifiers/unique.modifier';
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

export const zoranThePunisher: UnitBlueprint = {
  id: 'zoran-the-punisher',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Zoran, the Punisher',
  getDescription: () => {
    return `@Unique@.\n@Flank@.\n@On Enter@: Deal 3 damage to the unit directly in front of this.`;
  },
  staticDescription: `@Unique@.\n@Flank@.\n@On Enter@: Deal 3 damage to the unit directly in front of this.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-zoran-the-punisher',
  spriteId: 'zoran-the-punisher',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  manaCost: 6,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 3,
  maxHp: 7,
  job: CARD_JOBS.AVENGER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT),
        getPoints(points) {
          return points;
        }
      },
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT),
        getPoints(points) {
          return [
            {
              x: card.player.isPlayer1 ? points[0].x + 1 : points[0].x - 1,
              y: points[0].y
            }
          ];
        }
      }
    ]);
  },
  onInit(game, card) {
    card.addModifier(new UniqueModifier(game, card));
    card.addModifier(new FlankModifier(game, card));
    card.addModifier(
      new OnEnterModifier(game, card, event => {
        const targetUnit = event.data.affectedUnits[1];
        if (!targetUnit) return;
        targetUnit.takeDamage(
          card,
          new AbilityDamage({
            baseAmount: 2,
            source: card
          })
        );
      })
    );
  },
  onPlay(game, card) {}
};
