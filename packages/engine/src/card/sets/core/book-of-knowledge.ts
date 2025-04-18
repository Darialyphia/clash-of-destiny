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

export const bookOfKnowledge: ArtifactBlueprint = {
  id: 'book-of-knowledge',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  name: 'Searing Blade',
  getDescription: () => {
    return `Your Hero has +1 Spellpower.`;
  },
  staticDescription: `Your Hero has +1 Spellpower.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-test',
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  job: CARD_JOBS.AVENGER,
  abilities: [],
  artifactKind: ARTIFACT_KINDS.WEAPON,
  durability: 4,
  getFollowup: () => {
    return new NoFollowup();
  },
  onInit() {},
  onPlay(game, card, artifact) {
    const buff = new Modifier('book-of-knowledge-buff', game, card, {
      stackable: true,
      initialStacks: 1,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'spellpower',
          interceptor: (value, ctx, modifier) => {
            return value + modifier.stacks;
          }
        })
      ]
    });

    artifact.addModifier(
      new Modifier('book-of-knowledge', game, card, {
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
