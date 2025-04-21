import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { ProvokeModifier } from '../../../modifier/modifiers/provoke.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { CardBlueprint, UnitBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import type { SpellCard } from '../../entities/spell-card.entity';
import { MinionFollowup } from '../../followups/minion.followup';

export const ceruleanWaveDisciple: UnitBlueprint = {
  id: 'cerulean-wave-disciple',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Cerulean Waves Disciple',
  getDescription: () => {
    return `@Provoke@.\n@On Enter@: @Discover@ a Water spell.`;
  },
  staticDescription: `@Provoke@.\nThis has +2 Attack during your opponent's turn.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-cerulean-wave-disciple',
  spriteId: 'cerulean-waves-disciple',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 2,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(
      new OnEnterModifier(game, card, () => {
        const pool = Object.values(game.cardPool).filter(
          card => card.affinity === AFFINITIES.WATER && card.kind === CARD_KINDS.SPELL
        );
        const choices: CardBlueprint[] = [];
        for (let i = 0; i < 3; i++) {
          const index = game.rngSystem.nextInt(pool.length - 1);
          choices.push(...pool.splice(index, 1));
        }
        console.log(choices);

        game.interaction.startSelectingCards({
          choices: choices.map(choice => card.player.generateCard(choice.id)),
          minChoices: 1,
          maxChoices: 1,
          player: card.player,
          onComplete(selectedCards) {
            card.player.cards.addToHand(selectedCards[0]);
          }
        });
      })
    );
  },
  onPlay(game, card) {
    card.unit.addModifier(new ProvokeModifier(game, card));
  }
};
