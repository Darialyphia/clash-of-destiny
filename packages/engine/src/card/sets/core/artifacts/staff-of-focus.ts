import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { ARTIFACT_KINDS, CARD_KINDS, CARD_SETS, RARITIES } from '../../../card.enums';
import { mage } from '../heroes/mage';

export const staffOfFocus: ArtifactBlueprint = {
  id: 'staff-of-focus',
  name: 'Staff of Focus',
  description: 'At the start of your turn, gain 1 mana.',
  rarity: RARITIES.RARE,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ARTIFACT,
  artifactKind: ARTIFACT_KINDS.WEAPON,
  durability: 3,
  levelCost: 1,
  classIds: [mage.id],
  onPlay(game, card, artifact) {
    artifact.addModifier(
      new Modifier('staff-of-focus', game, card, {
        name: 'Staff of Focus',
        description: 'At the start of your turn, gain 1 mana.',
        stackable: false,
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.TURN_START,
            handler() {
              card.unit.mp.add(1);
            }
          })
        ]
      })
    );
  }
};
