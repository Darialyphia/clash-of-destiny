import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { MinionCardInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { DefiantModifier } from '../../../modifier/modifiers/defiant.modifier';
import { UniqueModifier } from '../../../modifier/modifiers/unique.modifier';
import { VigilantModifier } from '../../../modifier/modifiers/vigilant.modifier';
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

export const enjiOneManArmy: UnitBlueprint = {
  id: 'enji-one-man-army',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Enji, One Man army',
  getDescription: () => {
    return `@Unique@.\n @Defiant(2)@, @Vigilant@.\nThis costs one less for each minion your opponent controls and one more for each minion you control.`;
  },
  staticDescription: `@Unique@, @Defiant(2)@, @Vigilant@.\nThis costs one less for each minion your opponent controls and one more for each minion you control.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-enji-one-man-army',
  spriteId: 'enji-one-man-army',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  manaCost: 7,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 4,
  maxHp: 5,
  job: CARD_JOBS.FIGHTER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(new UniqueModifier(game, card));
    card.addModifier(
      new Modifier('enji-discount', game, card, {
        stackable: false,
        mixins: [
          new MinionCardInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value, ctx, modifier) {
              const allyMinions = modifier.target.player.units.filter(u => u.isMinion);
              const enemyMinions = modifier.target.player.opponent.units.filter(
                u => u.isMinion
              );

              const discount = enemyMinions.length - allyMinions.length;
              return (value as number) - discount;
            }
          })
        ]
      })
    );
  },
  onPlay(game, card) {
    card.unit.addModifier(new DefiantModifier(game, card, 2));
    card.unit.addModifier(new VigilantModifier(game, card));
  }
};
