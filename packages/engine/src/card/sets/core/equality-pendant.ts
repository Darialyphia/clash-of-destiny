import { GAME_PHASES } from '../../../game/game.enums';
import { GAME_EVENTS } from '../../../game/game.events';
import { GameEventModifierMixin } from '../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { TrinketModifier } from '../../../modifier/modifiers/trinket.modifier';
import type { ArtifactBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';

export const equalityPendant: ArtifactBlueprint = {
  id: 'equality-pendant',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  name: 'Equality Pendant',
  getDescription: () => {
    return `@Trinket@.\nAt the start of your turn, if you have less cards in hand than your opponent, draw a card and this artifact loses 1 durability.`;
  },
  staticDescription: `@Trinket@.\nAfter your draw phase, if you have less cards in hand than your opponent, draw a card and this artifact loses 1 durability.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-equality-pendant',
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 0,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.WANDERER,
  abilities: [],
  artifactKind: ARTIFACT_KINDS.RELIC,
  durability: 3,
  getFollowup: () => {
    return new NoFollowup();
  },
  onInit() {},
  onPlay(game, card, artifact) {
    artifact.addModifier(new TrinketModifier(game, card));
    artifact.addModifier(
      new Modifier('equality-pendant', game, card, {
        stackable: false,
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.PLAYER_START_TURN,
            handler(event) {
              if (!event.data.player.equals(card.player)) return;

              if (
                card.player.cards.hand.length < card.player.opponent.cards.hand.length
              ) {
                card.player.cards.draw(1);
                artifact.loseDurability(1);
              }
            }
          })
        ]
      })
    );
  }
};
