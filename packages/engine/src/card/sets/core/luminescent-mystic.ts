import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { MinionCardInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { UnitSelfEventModifierMixin } from '../../../modifier/mixins/self-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
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

export const luminescentMystic: UnitBlueprint = {
  id: 'luminescent-mystic',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Luminescent Mystic',
  getDescription: () => {
    return `@On Enter@: The next time damage would be dealt to your hero, prevent 2 of that damage.\n@Class Bonus@ +1 health.`;
  },
  staticDescription: `@On Enter@: The next time damage would be dealt to your hero, prevent 2 of that damage.\n@Class Bonus@ +1 health.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-luminescent-mystic',
  spriteId: 'luminescent-mystic',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 1,
  job: CARD_JOBS.AVENGER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT),
        getPoints: points => points
      },
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.ALLY_HERO),
        getPoints: () => [card.player.hero.position]
      }
    ]);
  },
  onInit(game, card) {
    card.addModifier(
      new Modifier('luminescent-mystic-class-bonus', game, card, {
        stackable: false,
        mixins: [
          new MinionCardInterceptorModifierMixin(game, {
            key: 'maxHp',
            interceptor(value) {
              if (card.job !== card.player.hero.card.job) return value;
              return value + 1;
            }
          })
        ]
      })
    );
  },
  onPlay(game, card) {
    card.player.hero.addModifier(
      new Modifier('luminescent-mystic-bubble', game, card, {
        stackable: false,
        name: 'Luminescent Mystic Bubble',
        description:
          'The next time damage would be dealt to your hero, prevent 2 of that damage.',
        icon: 'modifier-bubble',
        mixins: [
          new UnitSelfEventModifierMixin(game, {
            eventName: UNIT_EVENTS.BEFORE_RECEIVE_DAMAGE,
            handler(event, target, modifier) {
              const stop = modifier.target.addInterceptor('damageReceived', damage =>
                Math.max(damage - 2, 0)
              );
              modifier.target.once(UNIT_EVENTS.AFTER_RECEIVE_DAMAGE, () => {
                modifier.target.removeModifier(modifier);
                stop();
              });
            }
          })
        ]
      })
    );
  }
};
