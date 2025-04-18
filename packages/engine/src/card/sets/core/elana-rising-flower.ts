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
import { Modifier } from '../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../game/game.events';
import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { DurationModifierMixin } from '../../../modifier/mixins/duration.mixin';

export const elanaLv1: UnitBlueprint = {
  id: 'elana-rising-flower',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Elana, Rising Flower',
  getDescription: () => {
    return `@Elana Lineage@.\n@Inherited Effect@: Whenever you cast a spell or @secret@, gain 1 stack of @Dazzling Bloom@.`;
  },
  staticDescription: `@Elana Lineage@.\n@Inherited Effect@: Whenever you cast a spell or @secret@, gain 1 stack of Dazzling Bloom.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-elana-lv1',
  spriteId: 'elana-lv1',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'elena--rising-flower',
      getDescription() {
        return 'Remove 2 stacks of Dazzling Bloom from this unit to give a unit -1 Attack until your next turn.';
      },
      staticDescription:
        'Remove 2 stacks of Dazzling Bloom from this unit to give a unit -1 Attack until your next turn.',
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
      label: '-1 Attack',
      manaCost: 0,
      shouldExhaust: false,
      onResolve(game, card, targets) {
        const dazzlingBloom = card.unit.getModifier(DazzlingBloomModifier)!;
        dazzlingBloom.removeStacks(2);

        const targetUnit = game.unitSystem.getUnitAt(targets[0]!.cell)!;

        targetUnit.addModifier(
          new Modifier('dazzling-bloom-attack-debuff', game, card, {
            stackable: false,
            mixins: [
              new UnitInterceptorModifierMixin(game, {
                key: 'attack',
                interceptor(value) {
                  return Math.max(0, value - 1);
                }
              }),
              new DurationModifierMixin(game, 2)
            ]
          })
        );
      }
    }
  ],
  atk: 1,
  maxHp: 18,
  spellpower: 0,
  level: 1,
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
    const unit = card.unit;
    unit.addModifier(
      new Modifier('elana-lvl1-inherited-effect', game, card, {
        stackable: false,
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.PLAYER_AFTER_PLAY_CARD,
            handler(event) {
              if (!event.data.player.equals(card.player)) return;
              const { card: playedCard } = event.data.event.data;
              const isSpellOrSecret =
                playedCard.kind === CARD_KINDS.SPELL ||
                playedCard.kind === CARD_KINDS.SECRET;
              if (!isSpellOrSecret) return;
              unit.addModifier(new DazzlingBloomModifier(game, playedCard, 1));
            }
          })
        ]
      })
    );
  }
};
