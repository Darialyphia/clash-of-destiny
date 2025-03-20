import { GAME_EVENTS } from '../../game/game.events';
import type { InteractableBlueprint } from '../interactable-blueprint';

export const incomingExperienceGlobe: InteractableBlueprint = {
  id: 'incoming-experience-globe',
  name: 'Incoming Experience Globe',
  description:
    'At the end of this turn, if no unit stands here, an Experience Globe will spawn.',
  spriteId: 'incoming-experience-globe',
  iconId: 'interactable-incoming-experience-globe',
  walkable: true,
  attackable: false,

  onCreated(game, interactable) {
    game.once(GAME_EVENTS.TURN_END, () => {
      if (interactable.occupant) return;
      interactable.destroy();

      game.interactableSystem.add({
        blueprintId: 'experience-globe',
        position: interactable.position
      });
    });
  }
};
