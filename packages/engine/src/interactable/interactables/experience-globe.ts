import type { InteractableBlueprint } from '../interactable-blueprint';

export const experienceGlobe: InteractableBlueprint = {
  id: 'experience-globe',
  name: 'Experience Globe',
  description: 'Move here to pick up the globe and gain 2 EXP.',
  spriteId: 'experience-globe',
  iconId: 'interactable-experience-globe',
  walkable: true,
  attackable: false,

  onEnter(game, obstacle) {
    if (!obstacle.occupant) return;

    obstacle.occupant.gainExp(2);
    obstacle.destroy();
  }
};
