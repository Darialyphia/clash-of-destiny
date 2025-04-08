import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { WhileEquipedModifierMixin } from '../../../modifier/mixins/while-equiped.mixin';
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

export const testDestinyArtifact: ArtifactBlueprint = {
  id: 'test-destiny-artifact',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  name: 'Test Destiny Artifact',
  getDescription: () => {
    return `Your Hero has +1 Attack.`;
  },
  staticDescription: `Your Hero has +1 Attack.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-test',
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.AVENGER,
  abilities: [],
  artifactKind: ARTIFACT_KINDS.WEAPON,
  durability: 3,
  getFollowup: () => {
    return new NoFollowup();
  },
  onInit() {},
  onPlay(game, card, artifact) {
    const buff = new Modifier('test-destiny-artifacg-buff', game, card, {
      stackable: true,
      initialStacks: 1,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attack',
          interceptor: (value, ctx, modifier) => {
            return value + modifier.stacks;
          }
        })
      ]
    });

    artifact.addModifier(
      new Modifier('test-destiny-artifact', game, card, {
        stackable: false,
        mixins: [
          new WhileEquipedModifierMixin(game, {
            onApplied() {
              card.player.hero.addModifier(buff);
            },
            onRemoved() {
              card.player.hero.removeModifier(buff);
            }
          })
        ]
      })
    );
  }
};
