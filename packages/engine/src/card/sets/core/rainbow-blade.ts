import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { WhileEquipedModifierMixin } from '../../../modifier/mixins/while-equiped.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { OnDestroyedModifier } from '../../../modifier/modifiers/on-death.modifier';
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
import { rainbowPhoenix } from './rainbow-phoenix';

export const rainbowBlade: ArtifactBlueprint = {
  id: 'rainbow-blade',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.HARMONY,
  name: 'Rainbow Blade',
  getDescription: () => {
    return `Your Hero has +2 Attack.\n@On Death@: Summon a @Rainbow Phoenix@ in front of your hero and exhaust it.`;
  },
  staticDescription: `Your Hero has +2 Attack.\n@On Death@: Summon a @Rainbow Phoenix@ in front of your hero and exhaust it.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-rainbow-blade',
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  manaCost: 5,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SUMMONER,
  abilities: [],
  artifactKind: ARTIFACT_KINDS.WEAPON,
  durability: 3,
  getFollowup: () => {
    return new NoFollowup();
  },
  onInit() {},
  onPlay(game, card, artifact) {
    const buff = new Modifier('rainbow-blade-buff', game, card, {
      stackable: true,
      initialStacks: 1,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attack',
          interceptor: (value, ctx, modifier) => {
            return value + modifier.stacks * 2;
          }
        })
      ]
    });

    artifact.addModifier(
      new Modifier('rainbowBlade', game, card, {
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

    artifact.addModifier(
      new OnDestroyedModifier(game, card, {
        handler() {
          const cell = game.boardSystem.getCellInFront(card.player.hero);
          if (!cell) return;
          if (!cell?.isWalkable || cell.unit) return;
          const phoenix = card.player.summonMinionFromBlueprint(
            rainbowPhoenix.id,
            cell.position
          );
          phoenix?.exhaust();
        }
      })
    );
  }
};
