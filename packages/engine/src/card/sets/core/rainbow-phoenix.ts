import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { UnitSelfEventModifierMixin } from '../../../modifier/mixins/self-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { OnDeathModifier } from '../../../modifier/modifiers/on-death.modifier';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../modifier/modifiers/simple-attack-buff.modifier';
import { VigilantModifier } from '../../../modifier/modifiers/vigilant.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { UNIT_EVENTS } from '../../../unit/unit-enums';
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
    return `@On Enter@ Heal allies for 2.\n@On Death@: Equip a @Rainbow Blade@ to your hero.`;
  },
  staticDescription: `@On Enter@ Heal allies for 2.\n@On Death@: Equip a @Rainbow Blade@ to your hero.`,
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
  abilities: [],
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(
      new OnEnterModifier(game, card, () => {
        card.player.units.forEach(unit => {
          unit.heal(card, 2);
        });
      })
    );
  },
  onPlay(game, card) {
    card.unit.addModifier(
      new OnDeathModifier(game, card, {
        handler() {
          const blade = card.player.generateCard(rainbowBlade.id);
          blade.play();
        }
      })
    );
  }
};
