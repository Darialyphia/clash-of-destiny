import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../combat/damage';
import { OnDeathModifier } from '../../../modifier/modifiers/on-death.modifier';
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
import { rainbowBlade } from './rainbow-blade';

export const rainbowPhoenix: UnitBlueprint = {
  id: 'rainbow-phoenix',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.HARMONY,
  name: 'Rainbow Phoenix',
  getDescription: () => {
    return `@Unique@.\n@On Enter@ : Deal 2 damage to all enemies and heal all allies for 2.\n@On Death@: Equip a @Rainbow Blade@ to your hero.`;
  },
  staticDescription: `@Unique@.\n@On Enter@ : Deal 2 damage to all enemies and heal allies for 2.\n@On Death@: Equip a @Rainbow Blade@ to your hero.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-rainbow-phoenix',
  spriteId: 'rainbow-phoenix',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  manaCost: 6,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  atk: 3,
  maxHp: 4,
  job: CARD_JOBS.SUMMONER,
  unique: true,
  abilities: [],
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(new UniqueModifier(game, card));
    card.addModifier(
      new OnEnterModifier(game, card, () => {
        card.player.units.forEach(unit => {
          unit.heal(card, 2);
        });
        card.player.opponent.units.forEach(unit => {
          unit.takeDamage(
            card,
            new AbilityDamage({
              source: card,
              baseAmount: 2
            })
          );
        });
      })
    );
  },
  onPlay(game, card) {
    card.unit.addModifier(
      new OnDeathModifier(game, card, {
        handler() {
          // we schedule to make sure the action happens after other possible damage sources that would happen due to the death of the unit
          // to avoid the sword losing durability instantly
          // exemple: overheat chain reactions
          game.inputSystem.schedule(() => {
            const blade = card.player.generateCard(rainbowBlade.id);
            blade.play();
          });
        }
      })
    );
  }
};
