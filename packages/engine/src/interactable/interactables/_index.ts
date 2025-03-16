import { keyBy } from 'lodash-es';
import type { InteractableBlueprint } from '../interactable-blueprint';
import { experienceGlobe } from './experience-globe';
import { incomingExperienceGlobe } from './incoming.experience-globe';

export const OBSTACLES = keyBy(
  [experienceGlobe, incomingExperienceGlobe],
  'id'
) as Record<string, InteractableBlueprint>;
