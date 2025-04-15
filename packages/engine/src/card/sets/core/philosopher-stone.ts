import { PureDamage } from '../../../combat/damage';
import { WhileEquipedModifierMixin } from '../../../modifier/mixins/while-equiped.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { TrinketModifier } from '../../../modifier/modifiers/trinket.modifier';
import { PLAYER_EVENTS } from '../../../player/player-enums';
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

export const philosopherStone: ArtifactBlueprint = {
  id: 'philosopher-stone',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  name: "Philosopher's Stone",
  getDescription: () => {
    return `@Trinket@.\nAt the end of your turn, Your hero takes 1 damage and you gain 1 mana.`;
  },
  staticDescription: `@Trinket@.\nAt the end of your turn, Your hero takes 1 damage and you gain 1 mana.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-philosopher-stone',
  rarity: RARITIES.EPIC,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.SUMMONER,
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
      new Modifier('philosopher-stone', game, card, {
        stackable: false,
        mixins: [
          new WhileEquipedModifierMixin(game, {
            onApplied() {
              card.player.on(PLAYER_EVENTS.START_TURN, () => {
                card.player.hero.takeDamage(
                  card,
                  new PureDamage({ source: card, baseAmount: 1 })
                );
                card.player.mana.add(1);
              });
            },
            onRemoved() {}
          })
        ]
      })
    );
  }
};
