import { AbilityDamage, CombatDamage } from '../../../combat/damage';
import { GAME_EVENTS } from '../../../game/game.events';
import { GameEventModifierMixin } from '../../../modifier/mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { WhileEquipedModifierMixin } from '../../../modifier/mixins/while-equiped.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { UNIT_EVENTS } from '../../../unit/unit-enums';
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

export const wrathOfTheSkies: ArtifactBlueprint = {
  id: 'wrath-of-the-skies',
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.GENESIS,
  name: 'Wrath of the Skies',
  getDescription: () => {
    return `Your Hero has +1 Attack.\nWhen your hero deals combat damage to a unit, deal 2 damage to all joined units.`;
  },
  staticDescription: `Your Hero has +1 Attack.\nWhen your hero deals combat damage to a unit, deal 2 damage to all joined units.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'artifact-wrath-of-the-skies',
  rarity: RARITIES.EPIC,
  collectable: true,
  destinyCost: 3,
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
    const buff = new Modifier('wrath-of-the-skies-buff', game, card, {
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
      new Modifier('wrath-of--the-skies', game, card, {
        stackable: false,
        mixins: [
          new WhileEquipedModifierMixin(game, {
            onApplied() {
              card.player.hero.addModifier(buff);
            },
            onRemoved() {
              card.player.hero.removeModifier(buff);
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.UNIT_AFTER_DEAL_DAMAGE,
            handler(event) {
              if (!event.data.unit.equals(card.player.hero)) return;
              if (!(event.data.event.data.damage instanceof CombatDamage)) return;

              const target = event.data.event.data.targets[0];
              const joinedUnits = game.unitSystem
                .getJoinedUnits(target, unit => unit.player.equals(target.player))
                .filter(unit => !unit.equals(target));

              joinedUnits.forEach(unit => {
                unit.takeDamage(card, new AbilityDamage({ source: card, baseAmount: 2 }));
              });
            }
          })
        ]
      })
    );
  }
};
