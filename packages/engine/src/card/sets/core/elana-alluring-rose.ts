import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import type { UnitBlueprint } from '../../card-blueprint';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
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
import { NoFollowup } from '../../followups/no-followup';
import { DazzlingBloomModifier } from '../../../modifier/modifiers/dazzling-bloom.modifier';
import { ElusiveModifier } from '../../../modifier/modifiers/elusive.modifier';
import { DurationModifierMixin } from '../../../modifier/mixins/duration.mixin';
import { petalBlade } from './petal-blade';

export const elanaLv2: UnitBlueprint = {
  id: 'elana-alluring-rose',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Elana, Alluring Rose',
  getDescription: () => {
    return `@Elana Lineage@.\n@On Enter@: Add 2 @Petal Blade@ to your hand.`;
  },
  staticDescription: `@Elana Lineage@.\n@On Enter@: Add 2 @Petal Blade@ to your hand.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-elana-lv2',
  spriteId: 'elana-lv2',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  destinyCost: 2,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'elena-alluring-rose',
      getDescription() {
        return 'Remove 2 stacks of Dazzling Bloom : target unit gains @Elusive@ until the start of your next turn.';
      },
      staticDescription:
        'Remove 2 stacks of Dazzling Bloom : target unit gains @Elusive@ until the start of your next turn.',
      canUse(game, card) {
        if (!card.unit) return false;
        const dazzlingBloom = card.unit.getModifier(DazzlingBloomModifier);
        if (!dazzlingBloom) return false;
        if (dazzlingBloom.stacks < 2) return false;
        return true;
      },
      getFollowup() {
        return new AnywhereFollowup({ targetingType: TARGETING_TYPE.UNIT });
      },
      isCardAbility: false,
      label: 'Gain Elusive',
      manaCost: 0,
      shouldExhaust: false,
      onResolve(game, card, targets) {
        const dazzlingBloom = card.unit.getModifier(DazzlingBloomModifier)!;
        dazzlingBloom.removeStacks(2);

        const targetUnit = game.unitSystem.getUnitAt(targets[0]!.cell)!;

        targetUnit.addModifier(
          new ElusiveModifier(game, card, {
            otherMixins: [new DurationModifierMixin(game, 2)]
          })
        );
      }
    }
  ],
  atk: 2,
  maxHp: 20,
  spellpower: 1,
  level: 2,
  job: CARD_JOBS.WANDERER,
  lineage: 'Elana',
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.player.cards.addToHand(card.player.generateCard(petalBlade.id));
    card.player.cards.addToHand(card.player.generateCard(petalBlade.id));
  }
};
