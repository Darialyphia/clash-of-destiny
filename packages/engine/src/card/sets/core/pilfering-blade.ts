import { GAME_EVENTS } from '../../../game/game.events';
import { GameEventModifierMixin } from '../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
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

export const pilferingBlade: ArtifactBlueprint = {
  id: 'pilfering-blade',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  name: 'Pilfering Blade',
  getDescription: () => {
    return `When your hero attacks the enemy hero, gain one mana.`;
  },
  staticDescription: `When your hero attacks the enemy hero, gain one mana.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-pilfering-blade',
  rarity: RARITIES.RARE,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.AVENGER,
  abilities: [],
  artifactKind: ARTIFACT_KINDS.WEAPON,
  durability: 2,
  getFollowup: () => {
    return new NoFollowup();
  },
  onInit() {},
  onPlay(game, card, artifact) {
    artifact.addModifier(
      new Modifier('pilfering-blade', game, card, {
        stackable: false,
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.UNIT_AFTER_ATTACK,
            handler(event) {
              if (!event.data.unit.equals(card.player.hero)) return;
              const enemy = game.unitSystem.getUnitAt(event.data.event.target);
              if (!enemy) return;

              if (enemy.equals(card.player.opponent.hero)) {
                card.player.mana.add(1);
              }
            }
          })
        ]
      })
    );
  }
};
