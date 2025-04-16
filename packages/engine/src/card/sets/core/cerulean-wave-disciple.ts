import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { OnKillModifier } from '../../../modifier/modifiers/on-kill.modifier';
import { ProvokeModifier } from '../../../modifier/modifiers/provoke.modifier';
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

export const ceruleanWaveDisciple: UnitBlueprint = {
  id: 'cerulean-wave-disciple',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Cerulean Waves Disciple',
  getDescription: () => {
    return `@Provoke@.\nThis has +2 Attack during your opponent's turn.`;
  },
  staticDescription: `@Provoke@.\nThis has +2 Attack during your opponent's turn.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-cerulean-wave-disciple',
  spriteId: 'cerulean-waves-disciple',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 6,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new ProvokeModifier(game, card));
    card.unit.addModifier(
      new Modifier('cerulean-wave-disciple-buff', game, card, {
        stackable: false,
        name: 'Attack buff',
        description: "This has +2 Attack during your opponent's turn.",
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'attack',
            interceptor(value) {
              return game.gamePhaseSystem.turnPlayer.equals(card.player)
                ? value
                : value + 2;
            }
          })
        ]
      })
    );
  }
};
